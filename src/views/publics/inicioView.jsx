import React from 'react';
import { View, Text, ImageBackground, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import InicioPresenter from '../../presenters/InicioPresenter';
import inicioStyle from '../../styles/inicioStyle';


export default function Inicio() {
  const navigation = useNavigation();

  // Crear una instancia del Presentador y pasarle la Vista y la navegación
  const presenter = new InicioPresenter(
    {
      // Métodos de la Vista (si los necesitas)
    },
    navigation
  );

  const handleLogin = () => {
    presenter.navigateToLogin(); // Delegar la navegación al Presentador
  };

  const handleSingIn = () => {
    presenter.navigateToSingIn(); // Delegar la navegación al Presentador
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
        <View style={inicioStyle.socialContainer}>
          <TouchableOpacity style={inicioStyle.socialButton}>
            <FontAwesome name="apple" size={40} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={inicioStyle.socialButton}>
            <FontAwesome name="facebook" size={40} color="#3b5998" />
          </TouchableOpacity>
          <TouchableOpacity style={inicioStyle.socialButton}>
            <FontAwesome name="google" size={40} color="#db4437" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}