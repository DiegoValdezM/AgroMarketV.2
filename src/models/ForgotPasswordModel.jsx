// src/models/ForgotPasswordModel.js (estructura básica)
import { auth } from '../../firebaseConfig'; // Asegúrate que la ruta es correcta
import { sendPasswordResetEmail } from 'firebase/auth';

export default class ForgotPasswordModel {
  static async sendPasswordResetEmail(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log(`[ForgotPasswordModel] Correo de restablecimiento enviado a: ${email}`);
    } catch (error) {
      console.error(`[ForgotPasswordModel] Error al enviar correo de restablecimiento para ${email}:`, error);
      throw new Error(error.code || 'forgot-password-failed');
    }
  }
}