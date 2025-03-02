import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import AuthService from "../../services/loginService";  // Importar el servicio de autenticación
import UserModel from "../../models/loginModel";  // Importar el modelo de usuario
import styles from "../../styles/loginStyle";  // Importar los estilos

const Login = ({ navigation }) => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const user = await AuthService.login(correo, password); // Usar el servicio de autenticación
      const userModel = new UserModel(user.uid, user.email, user.displayName); // Crear el modelo de usuario
      Alert.alert("Inicio de sesión exitoso", `Bienvenido ${userModel.email}`);
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Iniciar Sesión" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.replace("Register")}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
