import React from 'react';
import { View, Text, ImageBackground, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native'; 

const { width, height } = Dimensions.get('window');

export default function Inicio() { // Cambia "App" por "Inicio" o el nombre que desees
  const navigation = useNavigation(); // Obtén la navegación

  const handleLogin = () => {
    navigation.navigate('Login'); // Navega a la pantalla de inicio
  };
  const handSingIn = () => {
    navigation.navigate('SingIn'); // Navega a la pantalla de inicio
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/3.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <BlurView intensity={50} style={styles.blurOverlay} />

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/1.jpg')}
            style={styles.logo}
          />
          <Text style={styles.title}>AgroMarket</Text>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handSingIn}>
          <Text style={styles.registerText}>REGÍSTRESE</Text>
        </TouchableOpacity>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="apple" size={40} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="facebook" size={40} color="#3b5998" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="google" size={40} color="#db4437" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.05,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#000',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.3,
    borderRadius: 30,
    marginBottom: height * 0.03,
    marginTop: height * 0.1,
  },
  loginText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerText: {
    fontSize: width * 0.04,
    color: '#000',
    marginBottom: height * 0.05,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  socialButton: {
    alignItems: 'center',
    padding: width * 0.03,
  },
});
