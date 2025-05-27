// src/context/chat.jsx
import React, { createContext, useState, useCallback } from "react"; // Quita useEffect si no lo usas directamente aquí
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  // doc, // No se usa 'doc' directamente aquí ahora
  getDocs // Se usa en fetchUsers
} from "firebase/firestore";
// Asumiendo que auth y db se exportan desde tu firebaseConfig.js REAL
import { db, auth as firebaseAuth } from "../../firebaseConfig"; // Usa un alias para auth para evitar colisión con la variable auth local si la tuvieras

// ... (console.logs de importación) ...
console.log("[ChatProvider] 'db' importada:", db);
console.log("[ChatProvider] 'firebaseAuth' importada:", firebaseAuth);


export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [chatData, setChatData] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [currentChatRoomId, setCurrentChatRoomId] = useState(null);
  const [activeChatListenerUnsubscribe, setActiveChatListenerUnsubscribe] = useState(null);
  const [selectedChatPartner, setSelectedChatPartner] = useState(null); // partner: { uid (Auth UID), displayName, email, ... }

  const fetchUsers = useCallback(async () => {
    const currentUserAuth = firebaseAuth.currentUser; // Usa la instancia de auth importada
    console.log("[ChatProvider fetchUsers] currentUserAuth:", currentUserAuth);
    if (!currentUserAuth) return;
    setLoadingUsers(true);
    try {
      const usersCollectionRef = collection(db, "usuarios");
      const q = query(usersCollectionRef);
      const querySnapshot = await getDocs(q);
      const fetchedUsers = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtra por authUid y asegúrate que el documento lo tenga
        if (data.authUid && data.authUid !== currentUserAuth.uid) {
          fetchedUsers.push({
            id: doc.id, // ID del documento de Firestore
            authUid: data.authUid, // UID de Firebase Auth
            nombre: data.nombre, // Asegúrate de que estos campos existen
            correo: data.correo,
            usuario: data.usuario,
            ...data // Incluye el resto de los datos del perfil si son necesarios
          });
        } else if (!data.authUid) {
            console.warn(`[ChatProvider fetchUsers] Documento usuario ${doc.id} no tiene campo authUid.`);
        }
      });
      setUsersList(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
    } finally {
      setLoadingUsers(false);
    }
  }, [firebaseAuth, db]); // Dependencias actualizadas

  const selectChat = useCallback((partner) => { // partner DEBE tener partner.uid como el Auth UID del otro usuario
    const currentUserAuth = firebaseAuth.currentUser;
    console.log("[ChatProvider selectChat] Partner recibido:", partner);
    console.log("[ChatProvider selectChat] currentUserAuth al seleccionar:", currentUserAuth);
    console.log("[ChatProvider selectChat] 'db' al seleccionar:", db);

    // 'partner.uid' ahora debe ser el Auth UID del partner
    if (!currentUserAuth || !partner || !partner.uid) {
      console.error("[ChatProvider selectChat] ERROR: currentUserAuth o partner.uid (Auth UID) no son válidos.");
      Alert.alert("Error", "No se pudo iniciar el chat. Información de usuario (Auth UID) incompleta.");
      return;
    }
    if (currentUserAuth.uid === partner.uid) { // Compara Auth UIDs
      console.warn("[ChatProvider selectChat] Intento de chatear consigo mismo.");
      Alert.alert("Aviso", "No puedes chatear contigo mismo.");
      return;
    }

    if (activeChatListenerUnsubscribe) {
      activeChatListenerUnsubscribe();
      console.log("[ChatProvider selectChat] Listener anterior desuscrito.");
    }

    // USA LOS AUTH UIDs para generar el chatRoomId
    const ids = [currentUserAuth.uid, partner.uid].sort();
    const chatRoomIdGenerated = ids.join('_');
    console.log("[ChatProvider selectChat] chatRoomId generado con Auth UIDs:", chatRoomIdGenerated);

    setCurrentChatRoomId(chatRoomIdGenerated);
    setSelectedChatPartner(partner); // partner ya tiene uid (Auth UID), displayName, email
    setChatData([]);
    setLoadingMessages(true);

    try {
      const messagesCollectionRef = collection(db, `chats/${chatRoomIdGenerated}/messages`);
      const q_messages = query(messagesCollectionRef, orderBy("time", "asc"));

      console.log(`[ChatProvider selectChat] Configurando onSnapshot para: chats/${chatRoomIdGenerated}/messages`);

      const unsubscribe = onSnapshot(q_messages,
        (querySnapshot) => { // CALLBACK DE ÉXITO
          console.log(`[ChatProvider selectChat] ONSNAPSHOT SUCCESS: Recibido snapshot para ${chatRoomIdGenerated}. Documentos: ${querySnapshot.docs.length}. isEmpty: ${querySnapshot.empty}`);
          const messages = [];
          querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
          });

          console.log(`[ChatProvider selectChat] ONSNAPSHOT SUCCESS: Mensajes procesados (${messages.length}). A punto de llamar a setChatData.`);
          setChatData(messages);
          console.log(`[ChatProvider selectChat] ONSNAPSHOT SUCCESS: setChatData llamado. A punto de llamar a setLoadingMessages(false).`);
          setLoadingMessages(false);
          console.log(`[ChatProvider selectChat] ONSNAPSHOT SUCCESS: Estados actualizados para ${chatRoomIdGenerated}.`);
        },
        (error) => { // CALLBACK DE ERROR
          console.error(`[ChatProvider selectChat] ONSNAPSHOT ERROR para ${chatRoomIdGenerated}. Objeto de error completo: `, JSON.stringify(error, Object.getOwnPropertyNames(error)));
          Alert.alert("Error de Chat", `No se pudieron cargar los mensajes (${error.code || 'desconocido'}): ${error.message}`);
          setLoadingMessages(false);
          console.log(`[ChatProvider selectChat] ONSNAPSHOT ERROR: setLoadingMessages(false) llamado.`);
        }
      );

      setActiveChatListenerUnsubscribe(() => unsubscribe);
      console.log(`[ChatProvider selectChat] Listener de onSnapshot configurado y guardado para ${chatRoomIdGenerated}.`);
    } catch (error) {
      console.error("[ChatProvider selectChat] Error síncrono configurando listener de mensajes (ej: collection() o query()):", error);
      Alert.alert("Error Crítico de Configuración", "No se pudo configurar el chat: " + error.message);
      setLoadingMessages(false);
    }
  }, [activeChatListenerUnsubscribe, firebaseAuth, db]); // Dependencias actualizadas

  const sendMessage = async (messageText) => { // fromUserEmail ya no es necesario, se toma de currentUserAuth
    const currentUserAuth = firebaseAuth.currentUser;
    console.log("[ChatProvider sendMessage] currentUserAuth:", currentUserAuth);
    console.log("[ChatProvider sendMessage] currentChatRoomId:", currentChatRoomId);

    if (!currentChatRoomId || !currentUserAuth) {
      console.error("sendMessage: No hay chat seleccionado o usuario no autenticado.");
      return;
    }
    if (messageText.trim() === "") return;

    try {
      await addDoc(collection(db, `chats/${currentChatRoomId}/messages`), {
        fromUid: currentUserAuth.uid, // UID de Firebase Auth del remitente
        fromEmail: currentUserAuth.email, // Email de Firebase Auth
        message: messageText,
        time: Date.now()
      });
      console.log(`[ChatProvider sendMessage] Mensaje enviado a ${currentChatRoomId}`);
    } catch (error) {
      console.error(`[ChatProvider sendMessage] Error enviando mensaje a ${currentChatRoomId}: `, error);
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
        usersList,
        loadingUsers,
        selectChat,
        currentChatRoomId
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};