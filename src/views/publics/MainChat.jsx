import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ChatContext } from "../../context/chat";
import { useAuth } from '../../context/AuthContext';

const MainChat = () => {
  const { chatData, loadingMessages, selectedChatPartner, currentChatRoomId, sendMessage, authLoading } = useContext(ChatContext);
  const { currentUser, userProfile } = useAuth(); // Get userProfile directly here for checks
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatData]);

  // Handle initial loading states
  if (authLoading || !currentUser || !userProfile) { // Check for authLoading and userProfile
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8a5c9f" />
        <Text style={styles.loadingText}>Cargando perfil de usuario...</Text>
      </View>
    );
  }

  if (!selectedChatPartner) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se ha seleccionado un compañero de chat.</Text>
        <Text style={styles.subText}>Por favor, regresa a la pantalla de selección de chat.</Text>
      </View>
    );
  }

  if (loadingMessages && chatData.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8a5c9f" />
        <Text style={styles.loadingText}>Cargando mensajes...</Text>
      </View>
    );
  }

  const handleSendMessage = async () => {
    // The sendMessage in ChatContext already has robust checks
    // We only need to check for messageText here
    if (messageText.trim() === "") return;

    try {
      await sendMessage(messageText);
      setMessageText("");
    } catch (error) {
      // Error message from ChatContext.sendMessage will be shown via Alert
      console.error("Error sending message from MainChat:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>
          Chat con: <Text style={styles.partnerName}>{selectedChatPartner.displayName || selectedChatPartner.email}</Text>
        </Text>
        {/* Removed currentChatRoomId from display as it's for debug */}
        {/* <Text style={styles.subHeader}>ID de Sala: <Text style={styles.roomIdText}>{currentChatRoomId}</Text></Text> */}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
      >
        {chatData.length === 0 && !loadingMessages && (
          <View style={styles.emptyChatContainer}>
            <Text style={styles.emptyChatText}>No hay mensajes en este chat. ¡Sé el primero en saludar!</Text>
          </View>
        )}

        {chatData.map(msg => (
          <View key={msg.id} style={[
            styles.messageBubbleBase,
            msg.fromUid === currentUser?.uid ? styles.myMessageBubble : styles.theirMessageBubble
          ]}>
            <Text style={styles.messageTextContent}>{msg.message}</Text>
            <Text style={styles.timeText}>
              {msg.time && typeof msg.time.toDate === 'function' ? msg.time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 10 },
  subText: { fontSize: 14, color: '#666', textAlign: 'center' },
  loadingText: { fontSize: 14, color: '#666', marginTop: 10 },

  headerContainer: {
    backgroundColor: '#e9e9e9',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  header: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  partnerName: { color: '#8a5c9f' },
  subHeader: { fontSize: 12, color: 'grey', textAlign: 'center' },
  roomIdText: { fontSize: 10, color: '#999' },

  messagesArea: { flex: 1 },
  messagesContent: { padding: 10 },

  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyChatText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },

  messageBubbleBase: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessageBubble: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  theirMessageBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  senderEmail: { fontSize: 10, color: 'grey', marginBottom: 2, fontWeight: 'bold'},
  messageTextContent: { fontSize: 15, color: '#333' },
  timeText: { fontSize: 10, color: 'grey', alignSelf: 'flex-end', marginTop: 3 },

  inputArea: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    backgroundColor: '#f9f9f9',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#fff',
    borderRadius: 20, paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10,
    marginRight: 8, fontSize: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: '#ddd',
  },
  sendButton: { backgroundColor: '#8a5c9f', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center', height: 40 },
  sendButtonDisabled: { backgroundColor: '#b0a0b9' },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default MainChat;