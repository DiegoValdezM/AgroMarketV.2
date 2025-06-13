// src/presenters/EditProfilePresenter.js
import EditProfileModel from '../models/EditProfileModel';
import { auth } from '../../firebaseConfig'; // Necesario para obtener el currentUser

export default class EditProfilePresenter {
  constructor(view, navigation) {
    this.view = view; // La vista debe implementar showLoading(), hideLoading(), showError(), showSuccess(), displayProfile()
    this.navigation = navigation;
  }

  /**
   * Carga los datos del perfil del usuario actual.
   */
  async loadUserProfile() {
    this.view.showLoading();
    const user = auth.currentUser;
    if (!user) {
      this.view.hideLoading();
      this.view.showError('No hay usuario autenticado.');
      this.navigation.navigate('Login'); // Redirige a login si no hay usuario
      return;
    }

    try {
      const profileData = await EditProfileModel.getUserProfile(user.uid);
      if (profileData) {
        // Combinar datos de Auth (email) con datos de Firestore
        this.view.displayProfile({
          email: user.email,
          nombre: profileData.usuario || '', // El campo en Firestore
          telefono: profileData.telefono || '',
          photoURL: profileData.photoURL || user.photoURL || '', // Usar foto de Firestore o Auth
        });
      } else {
        // Si no hay perfil en Firestore, mostrar solo datos de Auth
        this.view.displayProfile({
          email: user.email,
          nombre: user.displayName || '',
          telefono: '',
          photoURL: user.photoURL || '',
        });
        this.view.showError('No se encontró perfil completo en Firestore. Edita para crearlo.');
      }
    } catch (error) {
      console.error("[EditProfilePresenter.loadUserProfile] Error al cargar perfil:", error);
      this.view.showError('Error al cargar el perfil.');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Actualiza el perfil del usuario.
   * @param {object} formData - Datos del formulario: { currentPassword, newPassword, confirmNewPassword, nombre, telefono, newProfileImageUri }
   */
  async updateProfile(formData) {
    this.view.showLoading();
    const user = auth.currentUser;
    if (!user) {
      this.view.hideLoading();
      this.view.showError('No hay usuario autenticado. Inicie sesión nuevamente.');
      return;
    }

    const { currentPassword, newPassword, confirmNewPassword, nombre, telefono, newProfileImageUri } = formData;

    try {
      // 1. Reautenticar si se intenta cambiar la contraseña
      if (newPassword) {
        if (!currentPassword) {
          this.view.showError('Para cambiar la contraseña, debe ingresar su contraseña actual.');
          return;
        }
        if (newPassword !== confirmNewPassword) {
          this.view.showError('Las nuevas contraseñas no coinciden.');
          return;
        }
        if (newPassword.length < 6) {
          this.view.showError('La nueva contraseña debe tener al menos 6 caracteres.');
          return;
        }
        await EditProfileModel.reauthenticateUser(user.email, currentPassword);
        await EditProfileModel.updateAuthPassword(newPassword);
        this.view.showSuccess('Contraseña actualizada exitosamente.');
      }

      // 2. Actualizar foto de perfil en Azure y Auth
      let updatedPhotoURL = null;
      if (newProfileImageUri) {
        updatedPhotoURL = await EditProfileModel.uploadProfileImage(newProfileImageUri, user.uid);
        await EditProfileModel.updateAuthProfile({ photoURL: updatedPhotoURL });
      }

      // 3. Actualizar datos en Firestore (nombre, telefono, photoURL si se actualizó)
      const firestoreUpdates = {};
      if (nombre && nombre !== user.displayName) { // Compara con displayName de Auth si es el que usas
        firestoreUpdates.usuario = nombre; // El campo real en Firestore
      }
      if (telefono) { // Asume que 'telefono' es el campo en Firestore
        firestoreUpdates.telefono = telefono;
      }
      if (updatedPhotoURL) {
        firestoreUpdates.photoURL = updatedPhotoURL; // Guardar la URL en Firestore también
      }

      if (Object.keys(firestoreUpdates).length > 0) {
        await EditProfileModel.updateFirestoreProfile(user.uid, firestoreUpdates);
        this.view.showSuccess('Información de perfil actualizada.');
      }

      // Si se actualizó el nombre en Firestore, también actualizar displayName en Auth si es coherente
      if (nombre && nombre !== user.displayName) {
          await EditProfileModel.updateAuthProfile({ displayName: nombre });
      }

      this.view.showSuccess('Perfil actualizado exitosamente!');
      this.navigation.goBack(); // Regresar a la pantalla anterior
      
    } catch (error) {
      console.error("[EditProfilePresenter.updateProfile] Error actualizando perfil:", error);
      let errorMessage = 'Error al actualizar el perfil.';
      if (error.message === 'credenciales-invalidas-reautenticacion') {
        errorMessage = 'Contraseña actual incorrecta.';
      } else if (error.message.includes('auth/')) {
        errorMessage = 'Error de autenticación: ' + error.message.split('auth/')[1].replace(/-/g, ' ');
      } else if (error.message === 'azure-profile-image-upload-failed') {
        errorMessage = 'Error al subir la nueva imagen de perfil.';
      } else if (error.message === 'firestore-profile-update-failed') {
        errorMessage = 'Error al guardar los datos en la base de datos.';
      }
      this.view.showError(errorMessage);
    } finally {
      this.view.hideLoading();
    }
  }
}
