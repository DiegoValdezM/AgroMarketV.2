// Login.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import LoginPresenter from "../../presenters/LoginPresenter";
import loginStyles from "../../styles/loginStyle";

const Login = ({ navigation }) => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const presenter = new LoginPresenter({
    showError: (message) => Alert.alert("Error", message),
    showSuccess: (message) => Alert.alert("Inicio de sesión exitoso", message),
    navigateToHome: () => navigation.replace("Home"),
  });

  const handleLogin = () => {
    presenter.login(correo, password);
  };

  return (
    <View style={loginStyles.container}>
      <View style={loginStyles.logoContainer}>
        <Image source={require('../../../assets/1.jpg')} style={loginStyles.logo} />
        <Text style={loginStyles.title}>AgroMarket</Text>
      </View>
      <Text style={loginStyles.title}>Iniciar Sesión</Text>
      <TextInput
        style={loginStyles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={loginStyles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Iniciar Sesión" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.replace("SignIn")}>
        <Text style={loginStyles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;