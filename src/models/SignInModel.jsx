import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default class SignInModel {
  /**
   * Registra un usuario en Firebase Authentication
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña (6+ caracteres)
   * @returns {Promise<string>} UID del usuario creado
   */
  static async registerWithEmail(email, password) {
    try {
      console.log(`Registrando usuario: ${email}`); // Debug
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Usuario registrado en Auth:', userCredential.user.uid); // Debug
      return userCredential.user.uid;
    } catch (error) {
      console.error('Error en registerWithEmail:', error); // Debug detallado
      throw error; // Propaga el error ORIGINAL con code
    }
  }

  /**
   * Guarda los datos adicionales del usuario en Firestore
   * @param {object} userData - Datos del usuario
   * @param {string} userData.uid - ID del usuario en Auth
   */
  static async saveUserData(userData) {
    try {
      console.log('Guardando datos en Firestore:', userData); // Debug
      await addDoc(collection(db, 'usuarios'), {
        ...userData,
        createdAt: serverTimestamp(), // Mejor que new Date()
        lastLogin: serverTimestamp()
      });
      console.log('Datos guardados exitosamente'); // Debug
    } catch (error) {
      console.error('Error en saveUserData:', error); // Debug detallado
      throw error; // Propaga el error ORIGINAL
    }
  }
}