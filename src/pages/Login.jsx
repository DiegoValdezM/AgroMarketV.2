import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const Login = ({ navigation }) => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!correo || !password) {
      Alert.alert("Error", "Por favor, ingresa un correo y una contraseña.");
      return;
    }

    try {
      // Autenticación con Firebase Authentication
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        correo,
        password
      );

      // Si la autenticación es exitosa, redirige al usuario
      Alert.alert("Inicio de sesión exitoso", `Bienvenido ${correo}`);
      navigation.replace("Home");
    } catch (error) {
      // Si ocurre un error (como usuario no encontrado o contraseña incorrecta)
      Alert.alert("Error", "Usuario o contraseña incorrectos.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/1.jpg')}
                  style={styles.logo}
                />
                <Text style={styles.title}>AgroMarket</Text>
              </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
    marginTop: 10,
    textAlign: "center",
  },
});

export default Login;
