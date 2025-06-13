// src/presenters/ForgotPasswordPresenter.js (estructura básica)
import ForgotPasswordModel from '../models/ForgotPasswordModel'; // Lo crearemos después

export default class ForgotPasswordPresenter {
  constructor(view) {
    this.view = view; // La vista debe implementar showLoading(), hideLoading(), showSuccess(), showError(), navigateBack()
  }

  async sendPasswordResetEmail(email) {
    if (!email || !email.trim()) {
      this.view.showError('Por favor, ingrese su correo electrónico.');
      return;
    }

    this.view.showLoading();
    try {
      await ForgotPasswordModel.sendPasswordResetEmail(email);
      this.view.showSuccess('Si la dirección de correo electrónico está registrada, recibirá un enlace para restablecer su contraseña.');
      this.view.navigateBack(); // Volver a la pantalla anterior (login)
    } catch (error) {
      console.error("Error al enviar correo de restablecimiento:", error);
      let errorMessage = 'Ocurrió un error inesperado al enviar el correo.';
      if (error.message.includes('auth/user-not-found')) {
        errorMessage = 'El correo electrónico no está registrado.';
      } else if (error.message.includes('auth/invalid-email')) {
        errorMessage = 'La dirección de correo electrónico no es válida.';
      }
      this.view.showError(errorMessage);
    } finally {
      this.view.hideLoading();
    }
  }
}