// src/models/EditUserModel.js
import { db, auth } from '../../firebaseConfig'; // Solo db y auth, storage no se usa aquí directamente
import { serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export default class EditUserModel {

  static getCurrentAdminUser() { // O simplemente getCurrentUser si es genérico
    return auth.currentUser;
  }

  static getServerTimestamp() {
    return serverTimestamp();
  }

  static async updateUser(userId, dataToUpdate) {
    console.log(`[EditUserModel] updateUser llamado. UserID: ${userId}, Datos:`, dataToUpdate);
    try {
      if (!userId) {
        console.error("[EditUserModel] ID del usuario es requerido para actualizar.");
        throw new Error('user-id-required-for-update');
      }
      const userRef = doc(db, 'usuarios', userId); // 'usuarios' es tu colección

      await updateDoc(userRef, dataToUpdate);
      console.log('[EditUserModel] Usuario actualizado exitosamente en Firestore:', userId);
      return true;
    } catch (error) {
      console.error('[EditUserModel] Error actualizando usuario en Firestore:', userId, error);
      throw new Error('user-update-failed');
    }
  }

  // Ejemplo conceptual de cómo se podría llamar a una Cloud Function (esto no funcionará sin la CF)
  // static async updateUserRoleClaim(userId, newRole) {
  //   console.log(`[EditUserModel] Solicitando actualizar Custom Claim para ${userId} a ${newRole} vía Cloud Function.`);
  //   try {
  //     const setAdminRoleFunction = firebase.functions().httpsCallable('setCustomUserRole'); // Necesitas definir esta CF
  //     const response = await setAdminRoleFunction({ uidToUpdate: userId, roleToSet: newRole });
  //     console.log("[EditUserModel] Respuesta de Cloud Function para Custom Claim:", response);
  //     return response.data;
  //   } catch (error) {
  //     console.error("[EditUserModel] Error llamando a Cloud Function para Custom Claim:", error);
  //     throw new Error("custom-claim-update-failed");
  //   }
  // }
}