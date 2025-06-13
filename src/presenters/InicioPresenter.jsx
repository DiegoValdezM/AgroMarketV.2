// InicioPresenter.js
export default class InicioPresenter {
    constructor(view, navigation) {
      this.view = view;
      this.navigation = navigation;
    }
  
    navigateToLogin() {
      this.navigation.navigate('Login'); // Navega a la pantalla de Login
    }
  
    navigateToSingIn() {
      this.navigation.navigate('SignIn'); // Navega a la pantalla de Registro
    }

    navigateToForgotPassword() {
    this.navigation.navigate('ForgotPassword'); // 'ForgotPassword' será el nombre de tu nueva ruta
    }
  }