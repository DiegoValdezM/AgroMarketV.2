// src/models/EditProfileModel.js
import { db, auth } from '../../firebaseConfig'; // Importa la instancia de Firestore y Auth
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'; // ¡Añadido setDoc!
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default class EditProfileModel {

  /**
   * Sube una imagen de perfil a Azure Blob Storage usando SAS token.
   * @param {string} uri - URI local del archivo de imagen.
   * @param {string} userId - ID del usuario, para nombrar el archivo.
   * @returns {Promise<string>} URL pública del archivo subido.
   */
  static async uploadProfileImage(uri, userId) {
    const sasToken = "sv=2024-11-04&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2025-06-14T13:38:33Z&st=2025-06-12T05:38:33Z&spr=https&sig=vvO7VZRuFLCxkeiVGnoS00BKEm7TPh0Vuzj7vAwDTb4%3D"; // Reemplaza con tu SAS Token
    const accountName = "solicitudesarchivos";
    const containerName = "solicitudesarchivos";

    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Fetch fallido al obtener la imagen. Status: ${response.status}`);
      }
      const blob = await response.blob();
      const contentType = blob.type || 'application/octet-stream';

      const timestamp = new Date().getTime();
      const fileName = `profiles/${userId}/profile_${timestamp}`; 

      const azureURL = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;

      const uploadRes = await fetch(azureURL, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": contentType
        },
        body: blob
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error('Detalles del error de Azure:', errorText);
        throw new Error(`Error al subir imagen de perfil a Azure. Status: ${uploadRes.status}`);
      }

      const publicURL = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}`;
      console.log("[EditProfileModel.uploadProfileImage] Subido exitosamente a Azure:", publicURL);
      return publicURL;

    } catch (error) {
      console.error('[EditProfileModel.uploadProfileImage] Error subiendo imagen de perfil a Azure:', error);
      throw new Error('azure-profile-image-upload-failed');
    }
  }

  /**
   * Obtiene los datos del perfil de un usuario desde Firestore.
   * @param {string} userId - UID del usuario.
   * @returns {Promise<object | null>} Datos del perfil del usuario, o null si no existe.
   */
  static async getUserProfile(userId) {
    if (!userId) {
      console.error("[EditProfileModel.getUserProfile] userId es requerido.");
      return null;
    }
    try {
      const userDocRef = doc(db, 'usuarios', userId); 
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        console.log("[EditProfileModel.getUserProfile] Documento de usuario no encontrado para UID:", userId);
        return null;
      }
    } catch (error) {
      console.error("[EditProfileModel.getUserProfile] Error obteniendo perfil de usuario:", error);
      throw new Error('profile-fetch-failed');
    }
  }

  /**
   * Actualiza (o crea si no existe) los datos del perfil de un usuario en Firestore.
   * @param {string} userId - UID del usuario.
   * @param {object} profileData - Objeto con los campos a actualizar (ej. { nombre: 'Nuevo Nombre', telefono: '...' }).
   */
  static async updateFirestoreProfile(userId, profileData) {
    if (!userId) {
      console.error("[EditProfileModel.updateFirestoreProfile] userId es requerido.");
      throw new Error('user-id-required');
    }
    try {
      const userDocRef = doc(db, 'usuarios', userId);
      // ¡CAMBIO CLAVE AQUÍ! Usamos setDoc con merge: true en lugar de updateDoc
      await setDoc(userDocRef, profileData, { merge: true }); 
      console.log("[EditProfileModel.updateFirestoreProfile] Perfil de Firestore actualizado/creado para UID:", userId);
    } catch (error) {
      console.error("[EditProfileModel.updateFirestoreProfile] Error actualizando perfil en Firestore:", error);
      throw new new Error('firestore-profile-update-failed');
    }
  }

  /**
   * Reautentica al usuario (necesario para operaciones sensibles como cambiar contraseña/email).
   * @param {string} email - Email del usuario actual.
   * @param {string} password - Contraseña actual del usuario.
   * @returns {Promise<void>}
   */
  static async reauthenticateUser(email, password) {
    const user = auth.currentUser;
    if (!user) throw new Error('no-authenticated-user');
    if (!email || !password) throw new Error('email-password-required-for-reauth');

    const credential = EmailAuthProvider.credential(email, password);
    try {
      await reauthenticateWithCredential(user, credential);
      console.log("[EditProfileModel.reauthenticateUser] Usuario reautenticado exitosamente.");
    } catch (error) {
      console.error("[EditProfileModel.reauthenticateUser] Error reautenticando usuario:", error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('credenciales-invalidas-reautenticacion');
      }
      throw new Error('reauthentication-failed');
    }
  }

  /**
   * Actualiza la contraseña del usuario en Firebase Auth.
   * @param {string} newPassword - Nueva contraseña.
   */
  static async updateAuthPassword(newPassword) {
    const user = auth.currentUser;
    if (!user) throw new Error('no-authenticated-user');
    try {
      await updatePassword(user, newPassword);
      console.log("[EditProfileModel.updateAuthPassword] Contraseña de Firebase Auth actualizada.");
    } catch (error) {
      console.error("[EditProfileModel.updateAuthPassword] Error actualizando contraseña en Auth:", error);
      throw new Error('auth-password-update-failed');
    }
  }

  /**
   * Actualiza el perfil de usuario en Firebase Auth (displayName, photoURL).
   * @param {object} authProfileData - Objeto con displayName y/o photoURL.
   */
  static async updateAuthProfile(authProfileData) {
    const user = auth.currentUser;
    if (!user) throw new Error('no-authenticated-user');
    try {
      await updateProfile(user, authProfileData);
      console.log("[EditProfileModel.updateAuthProfile] Perfil de Firebase Auth (displayName/photoURL) actualizado.");
    } catch (error) {
      console.error("[EditProfileModel.updateAuthProfile] Error actualizando perfil en Auth:", error);
      throw new Error('auth-profile-update-failed');
    }
  }
}