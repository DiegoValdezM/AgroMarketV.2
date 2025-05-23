// src/presenters/EditPostPresenter.jsx
import EditPostModel from '../models/EditPostModel'; // <--- Usará el nuevo EditPostModel
import { Alert } from 'react-native';

export default class EditPostPresenter {
  constructor(view) {
    this.view = view || {
        showError: (message) => Alert.alert('Error', message),
        onSuccess: (message) => Alert.alert('Éxito', message || 'Operación completada')
    };
  }

  async handleUpdatePost(postId, updateData) {
    console.log("[EditPostPresenter] handleUpdatePost llamado. Post ID:", postId, "UpdateData:", JSON.stringify(updateData, null, 2));
    const { title, price, location, description, contacto, newImageLocalUri, originalImageUrlFromPost, removeCurrentImage } = updateData;

    if (!title || !location || !description) {
      this.view.showError('Título, ubicación y descripción son obligatorios');
      return;
    }
    // price ya es numérico desde la vista

    try {
      const user = EditPostModel.getCurrentUser(); // Usar método del EditPostModel
      if (!user) {
        this.view.showError('Debes iniciar sesión para actualizar.');
        return;
      }
      // Aquí se podría verificar si user.uid === post.userId (si pasas post.userId en updateData)

      let finalImageUrl = originalImageUrlFromPost;

      if (removeCurrentImage) {
        console.log("[EditPostPresenter] Usuario quiere remover la imagen actual.");
        finalImageUrl = null;
        if (originalImageUrlFromPost) {
          console.log("[EditPostPresenter] Intentando borrar imagen antigua de Storage:", originalImageUrlFromPost);
          await EditPostModel.deleteImageFromStorage(originalImageUrlFromPost);
          // No es crítico si el borrado falla, la referencia en Firestore se quitará.
        }
      } else if (newImageLocalUri) {
        console.log("[EditPostPresenter] Intentando subir nueva imagen:", newImageLocalUri);
        try {
          finalImageUrl = await EditPostModel.uploadImage(newImageLocalUri);
          console.log("[EditPostPresenter] Nueva imagen subida. URL:", finalImageUrl);
          // Si había una imagen original diferente a la nueva (y no se marcó para borrar explícitamente antes)
          if (originalImageUrlFromPost && originalImageUrlFromPost !== finalImageUrl) {
            console.log("[EditPostPresenter] Nueva imagen subida, intentando borrar imagen antigua de Storage:", originalImageUrlFromPost);
            await EditPostModel.deleteImageFromStorage(originalImageUrlFromPost);
          }
        } catch (uploadError) {
          console.error('[EditPostPresenter] Falló la subida de la nueva imagen:', uploadError);
          this.handleError(uploadError);
          return;
        }
      }

      const dataToUpdateInFirestore = {
        title,
        price,
        location,
        description,
        contacto,
        imageUrl: finalImageUrl, // Será la nueva URL, la original (si no se cambió), o null
        updatedAt: EditPostModel.getServerTimestamp(), // Usar método del EditPostModel
      };

      console.log("[EditPostPresenter] Datos finales para actualizar en Firestore:", JSON.stringify(dataToUpdateInFirestore, null, 2));
      await EditPostModel.updatePost(postId, dataToUpdateInFirestore);
      console.log("[EditPostPresenter] Post actualizado en Firestore. ID:", postId);

      this.view.onSuccess('Publicación actualizada con éxito.');

    } catch (error) {
      console.error("[EditPostPresenter] Error en handleUpdatePost:", error.message);
      this.handleError(error);
    }
  }

  handleError(error) {
    const errorMap = {
      'auth/network-request-failed': 'Error de conexión',
      'storage/object-not-found': 'Imagen no encontrada en Storage',
      'image-upload-failed': 'Error al subir la imagen.',
      'post-update-failed': 'Error al actualizar la publicación.',
      'user-id-required': 'Error interno: Falta el ID de usuario.', // No aplica aquí directamente pero puede venir de un modelo
      'post-id-required-for-update': 'Error interno: Falta el ID del post para actualizar.',
      'default': 'Ocurrió un error inesperado. Intenta nuevamente.'
    };
    const errorCode = error.message === 'image-upload-failed' || 
                      error.message === 'post-update-failed' ||
                      error.message === 'post-id-required-for-update'
        ? error.message
        : error.code || 'default';
    const message = errorMap[errorCode] || errorMap['default'];
    console.error('[EditPostPresenter] handleError ejecutado. Código mapeado:', errorCode, 'Msg original:', error.message, 'Error completo:', error);
    this.view.showError(message);
  }
}