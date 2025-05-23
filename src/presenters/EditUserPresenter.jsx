// src/presenters/EditUserPresenter.jsx
import EditUserModel from '../models/EditUserModel'; // Usará el nuevo EditUserModel
import { Alert } from 'react-native';

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
    if (!['user', 'admin'].includes(role)) { // Asegurar que el rol sea válido
        this.view.showError('Rol no válido seleccionado.');
        return;
    }

    try {
      // this.view.showLoading(); // Ya se maneja en la vista

      // No es necesario obtener el currentUser aquí si la acción es de un admin sobre otro usuario.
      // La protección de quién puede acceder a la pantalla EditUserScreen ya debería estar hecha.

      const dataToUpdateInFirestore = {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim(), // Solo actualiza Firestore, no el email de Auth
        role,
        telefono: telefono.trim(),
        ubicacion: ubicacion.trim(),
        usuario: usuario.trim(),
        isActive, // Actualiza el estado de actividad
        updatedAt: EditUserModel.getServerTimestamp(), // Añadir campo de fecha de actualización
      };

      console.log("[EditUserPresenter] Datos finales para actualizar en Firestore:", JSON.stringify(dataToUpdateInFirestore, null, 2));
      await EditUserModel.updateUser(userId, dataToUpdateInFirestore);
      console.log("[EditUserPresenter] Usuario actualizado en Firestore. ID:", userId);

      this.view.onSuccess('Usuario actualizado con éxito.');

      // IMPORTANTE: Si el rol cambió, se DEBERÍA llamar a una Cloud Function aquí
      // para actualizar los Custom Claims del usuario en Firebase Authentication.
      // Ejemplo conceptual:
      // if (userDataFromView.role !== originalUserRole) { // Necesitarías la 'originalUserRole'
      //   console.log(`[EditUserPresenter] El rol cambió. Se debería llamar a una Cloud Function para actualizar Custom Claims para el usuario ${userId} a ${userDataFromView.role}.`);
      //   // await EditUserModel.updateUserRoleClaim(userId, userDataFromView.role); // Esto sería un método que llama a una CF
      // }

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
    // Usar error.message si es uno de los errores personalizados que lanzas (ej., 'user-update-failed')
    const errorCode = ['user-update-failed', 'user-id-required-for-update'].includes(error.message)
        ? error.message
        : error.code || 'default';

    const message = errorMap[errorCode] || errorMap['default'];
    console.error('[EditUserPresenter] handleError ejecutado. Código mapeado:', errorCode, 'Msg original:', error.message, 'Error completo:', error);
    this.view.showError(message);
  }
}