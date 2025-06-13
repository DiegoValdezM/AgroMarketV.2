import React from 'react';
import { View, Text, ImageBackground, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import InicioPresenter from '../../presenters/InicioPresenter'; // Asegúrate que la ruta es correcta
import inicioStyle from '../../styles/inicioStyle'; // Asegúrate que la ruta es correcta


export default function Inicio() {
  const navigation = useNavigation();

  const presenter = new InicioPresenter(
    {
      // Puedes añadir métodos de la vista aquí si InicioPresenter los necesita para feedback
      // Por ejemplo: showMessage: (msg) => Alert.alert('Info', msg)
    },
    navigation
  );

  const handleLogin = () => {
    presenter.navigateToLogin();
  };

  const handleSingIn = () => {
    presenter.navigateToSingIn();
  };

  // Nuevo manejador para el enlace de "Recuperar Contraseña"
  const handleForgotPassword = () => {
    presenter.navigateToForgotPassword(); // Delegar la navegación al Presentador
  };

  return (
    <View style={inicioStyle.container}>
      <ImageBackground
        source={require('../../../assets/3.jpg')}
        style={inicioStyle.background}
        resizeMode="cover"
      >
        <BlurView intensity={50} style={inicioStyle.blurOverlay} />

        <View style={inicioStyle.logoContainer}>
          <Image
            source={require('../../../assets/1.jpg')}
            style={inicioStyle.logo}
          />
          <Text style={inicioStyle.title}>AgroMarket</Text>
        </View>

        <TouchableOpacity style={inicioStyle.loginButton} onPress={handleLogin}>
          <Text style={inicioStyle.loginText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSingIn}>
          <Text style={inicioStyle.registerText}>REGÍSTRESE</Text>
        </TouchableOpacity>

        {/* NUEVO ENLACE DE RECUPERAR CONTRASEÑA */}
        <TouchableOpacity onPress={handleForgotPassword} style={inicioStyle.forgotPasswordButton}>
          <Text style={inicioStyle.forgotPasswordText}>¿Olvidó su contraseña?</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

