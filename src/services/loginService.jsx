import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

class AuthService {
  static async login(email, password) {
    if (!email || !password) {
      throw new Error("Por favor, ingresa un correo y una contraseña.");
    }

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error("Usuario o contraseña incorrectos.");
    }
  }
}

export default AuthService;
