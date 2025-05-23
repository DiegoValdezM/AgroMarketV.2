// src/views/SignIn.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import SignInPresenter from '../../presenters/SignInPresenter';
import { Alert } from 'react-native'; 
import SignInStyles from '../../styles/SignInSyle';

const SignIn = ({ navigation }) => {
  const [form, setForm] = useState({
    usuario: '',
    nombre: '',
    apellidos: '',
    password: '',
    ubicacion: '',
    telefono: '',
    correo: ''
  });

  const [presenter] = useState(new SignInPresenter({
    showError: (message) => Alert.alert('Error', message),
    onSuccess: () => {
      Alert.alert('Éxito', 'Usuario registrado correctamente');
      navigation.replace('Login');
    }
  }));

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const fields = [
    { key: 'usuario', placeholder: 'Usuario' },
    { key: 'nombre', placeholder: 'Nombre' },
    { key: 'apellidos', placeholder: 'Apellidos' },
    { key: 'password', placeholder: 'Contraseña', secure: true },
    { key: 'ubicacion', placeholder: 'Ubicación' },
    { key: 'correo', placeholder: 'Correo', keyboardType: 'email-address' },
    { key: 'telefono', placeholder: 'Teléfono', keyboardType: 'phone-pad' }
  ];

  return (
    <View style={SignInStyles.container}>
      <Text style={SignInStyles.title}>Registro de Usuario</Text>

      {fields.map(({ key, placeholder, secure, keyboardType }) => (
        <TextInput
          key={key}
          style={SignInStyles.input}
          placeholder={placeholder}
          value={form[key]}
          onChangeText={(text) => handleChange(key, text)}
          secureTextEntry={secure}
          keyboardType={keyboardType}
        />
      ))}

      <Button title="Registrar" onPress={() => presenter.registerUser(form)} />
      
      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={SignInStyles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignIn;