// src/models/EditUserModel.js
import { db } from '../../firebaseConfig'; // Solo necesitamos la instancia de Firestore
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; // Usamos setDoc con merge

export default class EditUserModel {

  /**
   * Obtiene los datos de un perfil de usuario específico desde Firestore.
   * Útil para cargar la información al inicio de EditUserScreen.
   * @param {string} userId - UID del usuario a obtener.
   * @returns {Promise<object | null>} Datos del perfil del usuario, o null si no existe.
   */
  static async getUserProfileById(userId) {
    if (!userId) {
      console.error("[EditUserModel.getUserProfileById] userId es requerido.");
      return null;
    }
    try {
      const userDocRef = doc(db, 'usuarios', userId); // Colección 'usuarios'
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        console.log("[EditUserModel.getUserProfileById] Documento de usuario no encontrado para UID:", userId);
        return null;
      }
    } catch (error) {
      console.error("[EditUserModel.getUserProfileById] Error obteniendo perfil de usuario por ID:", error);
      throw new Error('user-profile-fetch-failed');
    }
  }

  /**
   * Actualiza los datos del perfil de un usuario específico en Firestore.
   * Esta función es para uso administrativo, permitiendo actualizar cualquier usuario.
   * Utiliza setDoc con merge: true para crear el documento si no existe y evitar sobrescrituras.
   * @param {string} userId - UID del usuario cuyo perfil se actualizará.
   * @param {object} userData - Objeto con los campos a actualizar en Firestore.
   */
  static async updateUser(userId, userData) {
    if (!userId) {
      console.error("[EditUserModel.updateUser] userId es requerido para la actualización.");
      throw new Error('user-id-required-for-update');
    }
    try {
      const userDocRef = doc(db, 'usuarios', userId); // Apuntamos directamente al documento por su UID
      await setDoc(userDocRef, { ...userData, updatedAt: serverTimestamp() }, { merge: true });
      console.log("[EditUserModel.updateUser] Perfil de usuario actualizado/creado para UID:", userId);
    } catch (error) {
      console.error("[EditUserModel.updateUser] Error actualizando usuario en Firestore:", error);
      throw new Error('user-update-failed');
    }
  }

}