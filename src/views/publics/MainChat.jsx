// src/views/publics/MainChat.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView, // O FlatList para mejor rendimiento con muchos mensajes
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator // Para el estado de carga de mensajes
} from "react-native";

// Contextos (VERIFICA ESTAS RUTAS)
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/chat"; // Asegúrate que el archivo se llame ChatContext.jsx o ajusta

// Navegación para React Native
import { useNavigation } from '@react-navigation/native';

// Moment para formateo de fechas
import Moment from "react-moment";
import 'moment/locale/es'; // Asegúrate que 'moment' y 'react-moment' estén instalados

const MainChat = () => {
  const navigation = useNavigation(); // Hook de React Navigation
  const { user, persistUser, signOut } = useContext(AuthContext); // Asumo que persistUser es una función de tu AuthContext
  const {
    sendMessage,
    chatData, // Este es el array de mensajes para el chat actual
    loadingMessages,
    selectedChatPartner, // Información del usuario con quien se está chateando
    currentChatRoomId // ID del chat actual
  } = useContext(ChatContext);

  const [messageToSave, setMessageToSave] = useState("");
  const scrollViewRef = useRef(null); // Para el auto-scroll

  // Efecto para verificar autenticación y redirigir si es necesario
  useEffect(() => {
    // Si persistUser es una función y devuelve false (o no hay usuario)
    if (!user && (typeof persistUser === 'function' && !persistUser())) {
      // Reemplaza "LoginScreen" con el nombre real de tu pantalla de login en el stack de navegación
      navigation.replace("LoginScreen");
    }
  }, [user, persistUser, navigation]);

  // Efecto para auto-scroll al final del chat cuando llegan nuevos mensajes o se carga
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatData]); // Se ejecuta cada vez que chatData cambia

  const handleSignOut = () => {
    if (signOut) signOut();
    navigation.replace("LoginScreen"); // Reemplaza "LoginScreen"
  };

  const handleSubmitMessage = async () => {
    if (!user || !user.email || !currentChatRoomId) {
      console.error("Error: Usuario no disponible o ningún chat seleccionado.");
      return;
    }
    if (messageToSave.trim() === "") return;

    try {
      await sendMessage(user.email, messageToSave); // sendMessage ya sabe el fromUid del auth.currentUser en el provider
      setMessageToSave("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      // Aquí podrías mostrar una alerta al usuario
    }
  };

  // Si no hay un chat seleccionado (selectedChatPartner es null),
  // esta pantalla no debería mostrar la interfaz de chat.
  // Podrías mostrar un mensaje o incluso no navegar aquí hasta que haya un partner.
  if (!selectedChatPartner) {
    return (
      <View style={styles.centeredScreen}>
        <Text style={styles.infoText}>No hay ningún chat seleccionado.</Text>
        {/* Opcional: botón para volver a la lista de selección de chat */}
        <TouchableOpacity onPress={() => navigation.navigate('ChatUserSelectionScreen')}>
          <Text style={styles.linkText}>Seleccionar usuario</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Los mensajes ya deberían venir ordenados por tiempo desde Firestore (orderBy en ChatProvider)
  const currentChatMessages = chatData;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screenContainer}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // Ajusta esto si tienes un header custom
    >
      {/* Header del Chat */}
      <View style={styles.chatHeader}>
        <Text style={styles.chatHeaderText}>
          {selectedChatPartner.displayName || selectedChatPartner.email}
        </Text>
        {/* Podrías añadir un botón para cerrar sesión aquí si es parte del diseño */}
        {/* <TouchableOpacity onPress={handleSignOut}><Text style={styles.headerButtonText}>Salir</Text></TouchableOpacity> */}
      </View>

      {/* Lista de Mensajes */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })} // Para asegurar scroll al cargar
        onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: false })} // Para asegurar scroll al montar
      >
        {loadingMessages && currentChatMessages.length === 0 && (
          <ActivityIndicator size="large" color="#8a5c9f" style={{ marginTop: 20 }} />
        )}
        {!loadingMessages && currentChatMessages.length === 0 && (
          <Text style={styles.emptyChatMessage}>Aún no hay mensajes. ¡Envía el primero!</Text>
        )}
        {currentChatMessages.map((c) => (
          <View
            key={c.id} // Usa el ID del mensaje como key
            style={[
              styles.messageBubbleContainer, // Contenedor para alinear
              c.fromUid === user?.uid ? styles.userMessageAlignment : styles.senderMessageAlignment,
            ]}
          >
            <View style={[
                styles.messageBubble,
                c.fromUid === user?.uid ? styles.userMessageBubble : styles.senderMessageBubble,
            ]}>
              {/* Opcional: Mostrar el nombre del remitente si no es el usuario actual y si es un chat grupal */}
              {/* {c.fromUid !== user?.uid && (
                <Text style={styles.messageSenderName}>{c.fromEmail || 'Remitente'}</Text>
              )} */}
              <Text style={c.fromUid === user?.uid ? styles.userMessageText : styles.senderMessageText}>
                {c.message}
              </Text>
              <Text style={styles.messageTime}>
                <Moment element={Text} format='HH:mm'>{c.time}</Moment>
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input para enviar mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={messageToSave}
          onChangeText={setMessageToSave}
          placeholder={`Escribe un mensaje...`}
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageToSave.trim() || loadingMessages) && styles.sendButtonDisabled]}
          onPress={handleSubmitMessage}
          disabled={!messageToSave.trim() || loadingMessages}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Un fondo neutro para el chat
  },
  centeredScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#8a5c9f', // Tu color principal
    marginTop: 10,
  },
  chatHeader: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#8a5c9f', // Tu color principal
    alignItems: 'center', // Centra el título
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#704a82', // Un borde ligeramente más oscuro
    // Para iOS podrías añadir SafeAreaView o paddingTop si el header interfiere con la barra de estado
  },
  chatHeaderText: {
    fontSize: 17,
    fontWeight: '600', // Semibold
    color: '#fff',
  },
  headerButtonText: { // Si añades botones al header
      color: '#fff',
      fontSize: 16,
      marginHorizontal: 10,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  messageBubbleContainer: { // Nuevo contenedor para alineación
    flexDirection: 'row', // Permite usar justifyContent para alinear
    marginVertical: 4,
  },
  userMessageAlignment: { // Para mensajes del usuario actual
    justifyContent: 'flex-end',
  },
  senderMessageAlignment: { // Para mensajes del otro usuario
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%', // Máximo ancho de la burbuja
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18, // Bordes más redondeados
    elevation: 1,
  },
  userMessageBubble: {
    backgroundColor: '#DCF8C6', // Verde claro (como WhatsApp)
    borderBottomRightRadius: 5, // Para la "cola" del mensaje
  },
  senderMessageBubble: {
    backgroundColor: '#FFFFFF', // Blanco
    borderBottomLeftRadius: 5, // Para la "cola" del mensaje
  },
  userMessageText: { // Color de texto para el usuario actual
    fontSize: 15,
    color: '#000', // Texto oscuro en burbuja clara
  },
  senderMessageText: { // Color de texto para el remitente
    fontSize: 15,
    color: '#000', // Texto oscuro en burbuja clara
  },
  messageSenderName: { // Si decides mostrar el nombre del remitente dentro de la burbuja
    fontSize: 12,
    color: '#555',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageTime: {
    fontSize: 10,
    color: '#666', // Un gris más oscuro para mejor contraste en ambas burbujas
    alignSelf: 'flex-end',
    marginTop: 3,
    marginLeft: 5, // Espacio si el texto es largo
  },
  emptyChatMessage: {
    textAlign: 'center',
    color: '#777',
    marginTop: 30,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    backgroundColor: '#f9f9f9',
    alignItems: 'flex-end', // Para alinear el botón si el input crece
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100, // Límite para que no crezca indefinidamente
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 8, // Ajustes de padding para multilínea
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 8,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  sendButton: {
    backgroundColor: '#8a5c9f',
    width: 40, // Botón circular
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#b0a0b9', // Un color más claro para deshabilitado
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16, // O usa un ícono aquí
  },
});

export default MainChat;