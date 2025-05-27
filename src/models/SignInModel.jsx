// src/models/SignInModel.js
import { auth, db } from '../../firebaseConfig'; // Asegúrate que la ruta sea correcta
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Añadido updateProfile
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Añadido doc y setDoc

export default class SignInModel {
  /**
   * Registra un usuario en Firebase Authentication
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña (6+ caracteres)
   * @returns {Promise<import('firebase/auth').User>} El objeto User completo de Firebase.
   */
  static async registerWithEmail(email, password) {
    try {
      console.log(`[SignInModel] Registrando usuario con email: ${email}`);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[SignInModel] Usuario registrado en Auth, UID:', userCredential.user.uid);
      return userCredential.user; // <-- CAMBIO: Devolver el objeto user completo
    } catch (error) {
      console.error('[SignInModel] Error en registerWithEmail:', error);
      throw error; // Propaga el error ORIGINAL con code y message
    }
  }

  /**
   * Actualiza el perfil del usuario en Firebase Authentication (displayName, photoURL).
   * @param {import('firebase/auth').User} user - El objeto User de Firebase.
   * @param {object} profileData - Objeto con { displayName, photoURL (opcional) }.
   */
  static async updateAuthUserProfile(user, profileData) {
    if (!user) {
      console.error("[SignInModel] No se proporcionó objeto 'user' para updateAuthUserProfile.");
      throw new Error("auth/internal-error-user-missing"); // Error personalizado
    }
    try {
      await updateProfile(user, profileData); // profileData = { displayName, photoURL }
      console.log("[SignInModel] Perfil de Auth actualizado para UID:", user.uid, "con data:", profileData);
    } catch (error) {
      console.error("[SignInModel] Error actualizando perfil de Auth:", error);
      throw error; // Propagar el error original
    }
  }

  /**
   * Guarda los datos adicionales del usuario en Firestore.
   * El ID del documento será el UID del usuario.
   * @param {string} userId - UID del usuario en Auth (será el ID del documento).
   * @param {object} userDataToSave - Datos del usuario a guardar (sin contraseña, uid).
   */
  static async saveUserData(userId, userDataToSave) {
    if (!userId) {
        console.error("[SignInModel] Se requiere UID para guardar datos de usuario en Firestore.");
        throw new Error("firestore/user-id-missing"); // Error personalizado
    }
    try {
      console.log(`[SignInModel] Guardando datos en Firestore para UID: ${userId}`, userDataToSave);
      // Usar setDoc para especificar el ID del documento como el UID del usuario
      const userDocRef = doc(db, 'usuarios', userId); 
      await setDoc(userDocRef, {
        ...userDataToSave,
        // createdAt ya viene en userDataToSave desde el presenter
        // lastLogin: serverTimestamp() // Puedes añadirlo si lo necesitas aquí
      });
      console.log('[SignInModel] Datos de usuario guardados exitosamente en Firestore para UID:', userId);
    } catch (error) {
      console.error('[SignInModel] Error en saveUserData:', error);
      // Podrías lanzar un error más específico si quieres, ej:
      // const firestoreError = new Error('firestore/save-failed');
      // firestoreError.originalError = error;
      // throw firestoreError;
      throw error; // Propaga el error ORIGINAL
    }
  }

  /**
   * Devuelve un Firebase Server Timestamp.
   * @returns {object} Un objeto ServerTimestamp.
   */
  static getServerTimestamp() {
    return serverTimestamp();
  }
}
