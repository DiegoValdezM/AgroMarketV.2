import React from 'react';
import { View, Text, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import styles from '../../styles/inicioStyle';
import { handleLogin, handleSignIn } from '../../services/inicioService';

export default function Inicio() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/3.jpg')} style={styles.background} resizeMode="cover">
        <BlurView intensity={50} style={styles.blurOverlay} />

        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/1.jpg')} style={styles.logo} />
          <Text style={styles.title}>AgroMarket</Text>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={() => handleLogin(navigation)}>
          <Text style={styles.loginText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSignIn(navigation)}>
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
