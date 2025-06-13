// src/views/auth/ForgotPasswordScreen.jsx (estructura básica)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import ForgotPasswordPresenter from '../../presenters/ForgotPasswordPresenter';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [presenter] = useState(new ForgotPasswordPresenter({
    showLoading: () => setLoading(true),
    hideLoading: () => setLoading(false),
    showSuccess: (message) => Alert.alert('Éxito', message),
    showError: (message) => Alert.alert('Error', message),
    navigateBack: () => navigation.goBack(),
  }));

  const handleResetPassword = () => {
    presenter.sendPasswordResetEmail(email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <Text style={styles.instructions}>
        Ingrese su correo electrónico para recibir un enlace para restablecer su contraseña.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar Enlace</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  instructions: { textAlign: 'center', marginBottom: 30, color: '#666' },
  input: { width: '100%', padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 20 },
  button: { backgroundColor: '#8a5c9f', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});