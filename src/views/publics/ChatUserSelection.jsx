// src/views/chat/ChatUserSelectionScreen.jsx (o la ruta que prefieras)

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Contextos
import { useAuth } from '../../context/AuthContext';
import { ChatContext } from '../../context/chat'; // Ajusta la ruta
import { db } from '../../../firebaseConfig'; // Ajusta la ruta

const UserItem = ({ item }) => { // 'item' es { id: (Firestore Auto-ID), authUid: (Firebase Auth UID), nombre, correo, ... }
  const { selectChat, selectedChatPartner } = useContext(ChatContext);
  const navigation = useNavigation();

  const handleStartChat = () => {
    // Ahora necesitamos el authUid del partner para generar el chatRoomId consistentemente
    if (!item.authUid) { // Verifica que el campo authUid exista y tenga valor
      Alert.alert("Error", "Información de UID de autenticación del usuario destino incompleta para iniciar chat.");
      console.error("Error: item.authUid no está definido para el partner:", item);
      return;
    }
    if (!item.correo) { // Mantén esta verificación si la usas para displayName
        Alert.alert("Error", "Email del usuario destino incompleto.");
        return;
    }

    const chatPartner = {
      // firestoreDocId: item.id, // ID del documento de Firestore (si lo necesitas)
      uid: item.authUid, // <--- USA EL authUid PARA EL CHAT (este es el UID de Firebase Auth del partner)
      displayName: item.nombre || item.usuario || item.correo,
      email: item.correo,
    };

    selectChat(chatPartner);
    navigation.navigate('Chat'); // Navega a tu pantalla de chat ('Chat' es el nombre en tu App.js)
  };

  const isActive = selectedChatPartner?.uid === item.authUid; // Compara con authUid

  return (
    <View style={[styles.userItemContainer, isActive && styles.activeUserItem]}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nombre || item.usuario || 'Usuario Anónimo'}</Text>
        <Text style={styles.userEmail}>{item.correo}</Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.chatButton]}
          onPress={handleStartChat}
        >
          <Text style={styles.actionButtonText}>Chatear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ChatUserSelection() {
  const { currentUser } = useAuth(); // currentUser.uid es el Auth UID del usuario logueado
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const usersCollectionRef = collection(db, 'usuarios');

    const unsubscribe = onSnapshot(
      usersCollectionRef,
      (querySnapshot) => {
        const usersData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Ahora filtra usando el campo 'authUid' del documento
          // y asegúrate de que el documento tenga el campo 'authUid'
          if (data.authUid && data.authUid !== currentUser.uid) {
            usersData.push({
              id: doc.id, // ID del documento de Firestore
              authUid: data.authUid, // UID de Firebase Authentication
              ...data,
            });
          } else if (!data.authUid) {
            console.warn(`Documento usuario ${doc.id} no tiene campo authUid.`);
          }
        });
        setUsers(usersData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error obteniendo usuarios para chat:", err);
        setError("No se pudieron cargar los usuarios. Intenta de nuevo más tarde.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser]); // Re-ejecutar si currentUser cambia

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" color="#8a5c9f" />;
  }

  if (error) {
    return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
  }

  if (!currentUser) {
    return <Text style={[styles.centered, styles.errorText]}>Debes iniciar sesión para ver usuarios.</Text>;
  }

return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar un Nuevo Chat</Text>
      {users.length === 0 && !loading ? (
        <Text style={styles.emptyListText}>No hay otros usuarios disponibles para chatear.</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={({ item }) => <UserItem item={item} />} // item ahora debe tener 'authUid'
          keyExtractor={(item) => item.id} // Sigue usando el ID del documento de Firestore como key
          contentContainerStyle={styles.listContentContainer}
        />
      )}
      {/* ... (ActivityIndicator y error Text) ... */}
    </View>
  );
}
// --- Estilos ---
// (Puedes reutilizar y adaptar los estilos de tu AdminUserListScreen)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f4f4f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 30,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  userItemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  activeUserItem: { // Estilo opcional para el chat activo
    borderColor: '#8a5c9f',
    borderWidth: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  userActions: {
    // No es necesario 'flexDirection: column' si solo hay un botón
    marginLeft: 10,
  },
  actionButton: {
    paddingVertical: 8, // Ligeramente más grande
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center', // Centrar texto
    minWidth: 80,
  },
  chatButton: {
    backgroundColor: '#27ae60', // Un verde para "Chatear"
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13, // Ligeramente más grande
    fontWeight: 'bold',
  },
});