// LoginPresenter.js
import AuthModel from "../models/loginModel";

export default class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async login(email, password) {
    if (!email || !password) {
      this.view.showError("Por favor, ingresa un correo y una contraseña.");
      return;
    }

    try {
      const user = await AuthModel.login(email, password);
      this.view.showSuccess(`Bienvenido ${email}`);
      this.view.navigateToHome();
    } catch (error) {
      this.view.showError("Usuario o contraseña incorrectos.");
    }
  }
}