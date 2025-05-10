// AuthModel.js
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default class AuthModel {
  static async login(email, password) {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user; // Retorna el usuario autenticado
    } catch (error) {
      throw error; // Lanza el error para que el Presentador lo maneje
    }
  }
}