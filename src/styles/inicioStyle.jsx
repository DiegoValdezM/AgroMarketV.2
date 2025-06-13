import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const inicioStyle = StyleSheet.create({
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
  forgotPasswordButton: {
    marginTop: 15, // Espacio entre el botón de registro y este
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline', // Subrayado para indicar que es un enlace
  }
});

export default inicioStyle;
