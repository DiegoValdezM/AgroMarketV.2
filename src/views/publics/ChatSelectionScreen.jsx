// src/views/publics/ChatSelectionScreen.jsx
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { ChatContext } from '../../context/chat';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const ChatSelectionScreen = () => {
  const { activeChatsList, selectChat, authLoading } = useContext(ChatContext); // También usamos authLoading del ChatContext
  const { currentUser, userProfile, loading: authContextLoading } = useAuth(); // Obtener userProfile y el loading de AuthContext
  const navigation = useNavigation();
  const [initialLoading, setInitialLoading] = useState(true);

  // Combinamos los estados de carga
  const isLoading = authLoading || authContextLoading || initialLoading;

  useEffect(() => {
    // Una vez que el currentUser y userProfile estén disponibles, quitamos el loading inicial
    if (currentUser?.uid && userProfile && !authLoading && !authContextLoading) {
      setInitialLoading(false);
    }
  }, [currentUser, userProfile, authLoading, authContextLoading]);


  const handleChatSelect = (chatItem) => {
    const partner = {
      uid: chatItem.partnerUid,
      displayName: chatItem.partnerName,
      email: chatItem.partnerEmail || '',
      photoURL: chatItem.partnerPhotoURL,
    };
    selectChat(partner);
    navigation.navigate('Chat');
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#8a5c9f" />
        <Text style={styles.loadingText}>Cargando chats y perfil...</Text>
      </View>
    );
  }

  if (activeChatsList.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>No tienes chats activos. ¡Envía tu primer mensaje desde una publicación!</Text>
      </View>
    );
  }

  const renderChatItem = ({ item }) => {
    // Determinar el prefijo del último mensaje
    const lastMessagePrefix = item.lastMessageFromUid === currentUser?.uid ? 'Yo: ' : `${(item.partnerName || 'Usuario').split(' ')[0]}: `;

    return (
      <TouchableOpacity style={styles.chatItemContainer} onPress={() => handleChatSelect(item)}>
        <Image
          source={item.partnerPhotoURL ? { uri: item.partnerPhotoURL } : require('../../../assets/profile-icon.webp')}
          style={styles.profileImage}
        />
        <View style={styles.chatDetails}>
          <Text style={styles.partnerName}>{item.partnerName || 'Usuario Desconocido'}</Text>
          <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail"> {/* Limitar a una línea */}
            {lastMessagePrefix}
            {item.lastMessageText || 'No hay mensajes aún.'}
          </Text>
          <View style={styles.chatItemFooter}>
            {item.lastMessageTime && (
              <Text style={styles.lastMessageTime}>
                {item.lastMessageTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                {' '}
                {item.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={activeChatsList}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 10,
  },
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  chatDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chatItemFooter: { // Nuevo contenedor para la hora y la insignia
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    width: '100%', // Asegura que ocupe todo el ancho disponible
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: { // Estilo para la insignia de no leídos
    backgroundColor: '#8a5c9f', // Un color distintivo
    borderRadius: 15,
    minWidth: 25, // Asegura un tamaño mínimo para un solo dígito
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6, // Espacio horizontal dentro de la insignia
    marginLeft: 10, // Espacio a la izquierda de la hora
  },
  unreadText: { // Estilo para el texto de la insignia
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ChatSelectionScreen;
