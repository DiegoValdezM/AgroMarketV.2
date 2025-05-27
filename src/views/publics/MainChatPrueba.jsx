// src/views/publics/MainChat.jsx (Empezando desde MainChatSimplified)
import React, { useContext, useState, useEffect, useRef } from 'react'; // Añade useState, useEffect, useRef
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput, // Añade TextInput
  TouchableOpacity, // Añade TouchableOpacity
  ScrollView,
  Alert // Para mostrar errores de sendMessage
} from 'react-native';
import { ChatContext } from "../../context/chat"; // VERIFICA RUTA
import { useAuth } from '../../context/AuthContext'; // Para obtener el email/uid del usuario actual

const MainChatRebuild = () => {
  const { chatData, loadingMessages, selectedChatPartner, currentChatRoomId, sendMessage } = useContext(ChatContext);
  const { currentUser } = useAuth(); // Necesitamos currentUser para saber quién envía
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatData]);

  if (!selectedChatPartner) { /* ... (código existente) ... */ }
  if (loadingMessages && chatData.length === 0) { /* ... (código existente) ... */ }

  const handleSendMessage = async () => {
    if (!currentUser || !currentUser.email) {
      Alert.alert("Error", "No se puede enviar mensaje, usuario no identificado.");
      return;
    }
    if (messageText.trim() === "") return;

    try {
      await sendMessage(messageText); // sendMessage en ChatProvider ya usa currentUser.uid y currentUser.email
      setMessageText("");
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el mensaje.");
      console.error("Error enviando mensaje:", error);
    }
  };

  return (
    <View style={styles.container}> {/* Podrías añadir KeyboardAvoidingView aquí más tarde */}
      <Text style={styles.header}>
        Chat con: {selectedChatPartner.displayName || selectedChatPartner.email}
      </Text>
      <Text style={styles.subHeader}>ID de Sala: {currentChatRoomId}</Text>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
      >
        {chatData.length === 0 && !loadingMessages && (
          <Text>No hay mensajes en este chat.</Text>
        )}
        {chatData.map(msg => (
          <View key={msg.id} style={[
              styles.messageBubbleBase,
              msg.fromUid === currentUser?.uid ? styles.myMessageBubble : styles.theirMessageBubble
          ]}>
            {/* Opcional: Mostrar email del remitente si no eres tú y quieres distinguirlo más */}
            {/* {msg.fromUid !== currentUser?.uid && <Text style={styles.senderEmail}>{msg.fromEmail}</Text>} */}
            <Text style={styles.messageTextContent}>{msg.message}</Text>
            <Text style={styles.timeText}>
              {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input para enviar mensaje */}
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
    </View>
  );
};

// ESTILOS (combina y adapta con los de tu MainChat original)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 18, fontWeight: 'bold', paddingVertical: 10, textAlign: 'center', backgroundColor: '#e9e9e9' },
  subHeader: { fontSize: 12, color: 'grey', paddingBottom: 5, textAlign: 'center', backgroundColor: '#e9e9e9' },
  messagesArea: { flex: 1 },
  messagesContent: { padding: 10 },
  messageBubbleBase: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 4,
    elevation: 1,
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
  messageTextContent: { fontSize: 15 },
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

export default MainChatRebuild; // Usa este nuevo nombre