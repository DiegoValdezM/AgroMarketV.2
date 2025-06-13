import React, { createContext, useState, useCallback, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
  increment // ¡Importante para incrementar contadores!
} from "firebase/firestore";
import { db, auth as firebaseAuth } from "../../firebaseConfig"; // Asegúrate que estas rutas y nombres son correctos
import { Alert } from "react-native";
import { useAuth } from './AuthContext'; // Importa useAuth para obtener el currentUser y userProfile

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const [chatData, setChatData] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentChatRoomId, setCurrentChatRoomId] = useState(null);
  const [activeChatListenerUnsubscribe, setActiveChatListenerUnsubscribe] = useState(null);
  const [selectedChatPartner, setSelectedChatPartner] = useState(null);

  const [activeChatsList, setActiveChatsList] = useState([]);
  // Ya no necesitamos un estado para el unsubscribe del listener de activeChatsList
  // porque lo manejaremos directamente en el useEffect.

  // Debugging: Log userProfile changes
  useEffect(() => {
    console.log("[ChatProvider] userProfile changed:", userProfile ? 'loaded' : 'null/loading');
  }, [userProfile]);

  // Función memoizada para escuchar los chats activos del usuario actual
  const listenToActiveChats = useCallback(() => {
    if (!currentUser?.uid) {
      console.log("[ChatProvider] No hay usuario autenticado para escuchar chats activos.");
      setActiveChatsList([]);
      // Si no hay usuario, desuscribe cualquier listener anterior de chat activo
      if (activeChatListenerUnsubscribe) {
        activeChatListenerUnsubscribe();
        setActiveChatListenerUnsubscribe(null); // Resetea el estado
      }
      return () => {}; // Retorna una función vacía para que el useEffect no falle
    }

    const activeChatsCollectionRef = collection(db, `usuarios/${currentUser.uid}/activeChats`);
    const q = query(activeChatsCollectionRef, orderBy('lastMessageTime', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`[ChatProvider listenToActiveChats] Snapshot recibido para chats activos de ${currentUser.uid}: ${snapshot.docs.length} chats.`);
      const chats = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          ...data,
          lastMessageTime: data.lastMessageTime ? data.lastMessageTime.toDate() : null
        });
      });
      setActiveChatsList(chats);
    }, (error) => {
      console.error("[ChatProvider listenToActiveChats] Error escuchando chats activos: ", error);
      Alert.alert("Error de Chat", "No se pudieron cargar tus chats activos.");
    });

    // ¡CAMBIO CLAVE! Retornamos la función unsubscribe directamente.
    // El useEffect que llama a esta función se encargará de guardarla y ejecutarla al limpiar.
    return unsubscribe; 
  }, [currentUser, db, activeChatListenerUnsubscribe]); // Dependencia added for activeChatListenerUnsubscribe to ensure proper cleanup if main chat changes.

  // useEffect para montar y desmontar el listener de chats activos
  useEffect(() => {
    const unsubscribeActiveChats = listenToActiveChats();
    
    // Función de limpieza para desmontar el listener cuando el componente se desmonte o las dependencias cambien
    return () => {
      if (unsubscribeActiveChats) unsubscribeActiveChats();
    };
  }, [listenToActiveChats]); // La dependencia es listenToActiveChats (la función memoizada)


  // fetchUsers se mantiene si es necesario para la selección inicial de chat o nuevas conversaciones,
  // pero ya no es la fuente principal para listar chats activos.
  const fetchUsers = useCallback(async () => {
    const currentUserAuth = firebaseAuth.currentUser;
    if (!currentUserAuth) return;
    try {
      const usersCollectionRef = collection(db, "usuarios");
      const q = query(usersCollectionRef);
      const querySnapshot = await getDocs(q);
      const fetchedUsers = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.authUid && data.authUid !== currentUserAuth.uid) {
          fetchedUsers.push({
            id: doc.id,
            authUid: data.authUid,
            nombre: data.nombre,
            correo: data.correo,
            usuario: data.usuario,
            photoURL: data.photoURL || null,
            ...data
          });
        } else if (!data.authUid) {
            console.warn(`[ChatProvider fetchUsers] Documento usuario ${doc.id} no tiene campo authUid.`);
        }
      });
      // setUsersList(fetchedUsers); // Removed setState here to avoid unnecessary renders if not used in primary UI
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  }, [firebaseAuth, db]);


  const selectChat = useCallback(async (partner) => { // selectChat ahora es async para el setDoc
    if (!currentUser || !partner || !partner.uid) {
      console.error("[ChatProvider selectChat] ERROR: currentUser o partner.uid no son válidos.");
      Alert.alert("Error", "No se pudo iniciar el chat. Información de usuario incompleta.");
      return;
    }
    if (currentUser.uid === partner.uid) {
      console.warn("[ChatProvider selectChat] Intento de chatear consigo mismo.");
      Alert.alert("Aviso", "No puedes chatear contigo mismo.");
      return;
    }

    if (activeChatListenerUnsubscribe) {
      activeChatListenerUnsubscribe();
      console.log("[ChatProvider selectChat] Listener anterior desuscrito.");
    }

    const ids = [currentUser.uid, partner.uid].sort();
    const chatRoomIdGenerated = ids.join('_');
    console.log("[ChatProvider selectChat] chatRoomId generado con Auth UIDs:", chatRoomIdGenerated);

    setCurrentChatRoomId(chatRoomIdGenerated);
    setSelectedChatPartner(partner); // Establece el partner seleccionado
    setChatData([]);
    setLoadingMessages(true);

    try {
      const messagesCollectionRef = collection(db, `chats/${chatRoomIdGenerated}/messages`);
      const q_messages = query(messagesCollectionRef, orderBy("time", "asc"));

      const unsubscribe = onSnapshot(q_messages, (querySnapshot) => {
        console.log(`[ChatProvider selectChat] Snapshot recibido para ${chatRoomIdGenerated}, ${querySnapshot.docs.length} mensajes.`);
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        setChatData(messages);
        setLoadingMessages(false);
      }, (error) => {
        console.error(`[ChatProvider selectChat] Error en onSnapshot para ${chatRoomIdGenerated}: `, JSON.stringify(error, Object.getOwnPropertyNames(error)));
        Alert.alert("Error de Chat", "No se pudieron cargar los mensajes: " + error.message);
        setLoadingMessages(false);
      });

      setActiveChatListenerUnsubscribe(() => unsubscribe);
      console.log(`[ChatProvider selectChat] Listener configurado para ${chatRoomIdGenerated}.`);

      // Reiniciar el contador de no leídos para el usuario actual al seleccionar el chat
      try {
        // Usa setDoc con merge:true para no sobrescribir todo el documento de activeChats
        await setDoc(doc(db, 'usuarios', currentUser.uid, 'activeChats', partner.uid), {
            unreadCount: 0,
        }, { merge: true });
        console.log(`[ChatProvider selectChat] Contador de no leídos reiniciado para el chat con ${partner.uid} por ${currentUser.uid}.`);
      } catch (error) {
        console.error("[ChatProvider selectChat] Error al reiniciar contador de no leídos:", error);
      }

    } catch (error) {
      console.error("[ChatProvider selectChat] Error configurando listener de mensajes:", error);
      Alert.alert("Error Crítico", "No se pudo configurar el chat: " + error.message);
      setLoadingMessages(false);
    }
  }, [activeChatListenerUnsubscribe, currentUser, db]); // Dependencia added for activeChatListenerUnsubscribe for cleanup


  const sendMessage = async (messageText) => {
    // Validaciones detalladas para depuración
    if (!currentChatRoomId) {
      console.error("sendMessage ERROR: currentChatRoomId es null.");
      Alert.alert("Error", "No se pudo enviar el mensaje. Sala de chat no seleccionada.");
      return;
    }
    if (!currentUser) {
      console.error("sendMessage ERROR: currentUser es null.");
      Alert.alert("Error", "No se pudo enviar el mensaje. Usuario no autenticado.");
      return;
    }
    if (!userProfile) {
      console.error("sendMessage ERROR: userProfile es null. El perfil de AuthContext aún no se ha cargado.");
      Alert.alert("Error", "No se pudo enviar el mensaje. Información de tu perfil no cargada.");
      return;
    }
    if (!selectedChatPartner) {
      console.error("sendMessage ERROR: selectedChatPartner es null. Compañero de chat no seleccionado.");
      Alert.alert("Error", "No se pudo enviar el mensaje. Compañero de chat no seleccionado.");
      return;
    }

    if (messageText.trim() === "") return;

    try {
      // 1. Añadir el mensaje a la subcolección de mensajes del chat
      await addDoc(collection(db, `chats/${currentChatRoomId}/messages`), {
        fromUid: currentUser.uid,
        fromEmail: currentUser.email,
        message: messageText,
        time: serverTimestamp()
      });

      const partnerName = selectedChatPartner.displayName || selectedChatPartner.email || 'Usuario';
      const partnerPhoto = selectedChatPartner.photoURL || null;
      const partnerEmail = selectedChatPartner.email || selectedChatPartner.uid + '@no-email.com';

      // 2. Actualizar el resumen del chat activo para el REMITENTE (tu usuario)
      await setDoc(doc(db, 'usuarios', currentUser.uid, 'activeChats', selectedChatPartner.uid), {
        chatRoomId: currentChatRoomId,
        lastMessageText: messageText,
        lastMessageTime: serverTimestamp(),
        lastMessageFromUid: currentUser.uid, // ¡Guardamos el UID del remitente!
        partnerUid: selectedChatPartner.uid,
        partnerName: partnerName,
        partnerPhotoURL: partnerPhoto,
        partnerEmail: partnerEmail,
        unreadCount: 0, // El remitente ha leído su propio mensaje, así que su contador es 0
      }, { merge: true });

      // 3. Actualizar el resumen del chat activo para el RECEPTOR (el partner)
      const currentUserName = userProfile.usuario || currentUser.displayName || currentUser.email || 'Yo';
      const currentUserPhoto = userProfile.photoURL || currentUser.photoURL || null;
      const currentUserEmail = currentUser.email || currentUser.uid + '@no-email.com';

      await setDoc(doc(db, 'usuarios', selectedChatPartner.uid, 'activeChats', currentUser.uid), {
        chatRoomId: currentChatRoomId,
        lastMessageText: messageText,
        lastMessageTime: serverTimestamp(),
        lastMessageFromUid: currentUser.uid, // ¡Guardamos el UID del remitente!
        partnerUid: currentUser.uid, // Aquí el partner para el receptor es el remitente actual
        partnerName: currentUserName,
        partnerPhotoURL: currentUserPhoto,
        partnerEmail: currentUserEmail,
        unreadCount: increment(1), // ¡Incrementa el contador de no leídos para el receptor!
      }, { merge: true });

      console.log(`[ChatProvider sendMessage] Mensaje enviado y resúmenes de chat activos actualizados.`);
    } catch (error) {
      console.error(`[ChatProvider sendMessage] Error enviando mensaje y actualizando resúmenes: `, error);
      Alert.alert("Error", "No se pudo enviar el mensaje: " + error.message);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sendMessage,
        chatData,
        loadingMessages,
        selectedChatPartner,
        fetchUsers, 
        selectChat,
        currentChatRoomId,
        activeChatsList, // Exporta la lista de chats activos
        authLoading 
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
