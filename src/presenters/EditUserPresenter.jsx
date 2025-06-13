// src/presenters/EditUserPresenter.jsx (Modificado)
import EditUserModel from '../models/EditUserModel'; // ¡CAMBIO CLAVE! Importamos el nuevo modelo
import { Alert } from 'react-native';
import { serverTimestamp } from 'firebase/firestore'; // Necesario para serverTimestamp si no se pasa desde el modelo

export default class EditUserPresenter {
  constructor(view) {
    this.view = view || {
        showError: (message) => Alert.alert('Error', message),
        onSuccess: (message) => Alert.alert('Éxito', message || 'Operación completada')
    };
  }

  async handleUpdateUser(userId, userDataFromView) {
    console.log("[EditUserPresenter] handleUpdateUser llamado. User ID:", userId, "Datos:", JSON.stringify(userDataFromView, null, 2));

    const { nombre, apellidos, correo, role, telefono, ubicacion, usuario, isActive } = userDataFromView;

    // Validaciones básicas
    if (!nombre || !correo) {
      this.view.showError('Nombre y correo son obligatorios.');
      return;
    }
    if (!['user', 'admin'].includes(role)) {
        this.view.showError('Rol no válido seleccionado.');
        return;
    }

    try {
      // No es necesario obtener el currentUser aquí.
      // La protección de quién puede acceder a la pantalla EditUserScreen ya debe estar hecha en la vista.

      const dataToUpdateInFirestore = {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim(),
        role,
        telefono: telefono.trim(),
        ubicacion: ubicacion.trim(),
        usuario: usuario.trim(),
        isActive,
        // updatedAt: serverTimestamp(), // Esto ya se maneja dentro de EditUserModel.updateUser
      };

      console.log("[EditUserPresenter] Datos finales para actualizar en Firestore:", JSON.stringify(dataToUpdateInFirestore, null, 2));
      // ¡CAMBIO CLAVE! Llamamos al método updateUser del nuevo modelo
      await EditUserModel.updateUser(userId, dataToUpdateInFirestore);
      console.log("[EditUserPresenter] Usuario actualizado en Firestore. ID:", userId);

      this.view.onSuccess('Usuario actualizado con éxito.');

      // IMPORTANTE: Si el rol cambió, se DEBERÍA llamar a una Cloud Function aquí
      // para actualizar los Custom Claims del usuario en Firebase Authentication.
      // (Esta parte es conceptual y requiere implementación de Cloud Functions)

    } catch (error) {
      console.error("[EditUserPresenter] Error en handleUpdateUser:", error.message, error);
      this.handleError(error);
    }
  }

  handleError(error) {
    const errorMap = {
      'user-update-failed': 'Error al actualizar el usuario en Firestore.',
      'user-id-required-for-update': 'Error interno: Falta el ID del usuario para actualizar.',
      'default': 'Ocurrió un error inesperado. Intenta nuevamente.'
    };
    const errorCode = ['user-update-failed', 'user-id-required-for-update'].includes(error.message)
        ? error.message
        : error.code || 'default';

    const message = errorMap[errorCode] || errorMap['default'];
    console.error('[EditUserPresenter] handleError ejecutado. Código mapeado:', errorCode, 'Msg original:', error.message, 'Error completo:', error);
    this.view.showError(message);
  }
}