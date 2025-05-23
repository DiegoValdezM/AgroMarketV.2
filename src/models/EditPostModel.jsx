// src/models/EditPostModel.js
import { db, storage, auth } from '../../firebaseConfig'; // Ajusta la ruta
import { serverTimestamp, doc, updateDoc, deleteField } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export default class EditPostModel {

  // --- COPIADO DE PostModel (con logs de debug) ---
  // Podría refactorizarse a un servicio común o modelo base si la duplicación se vuelve un problema.
  static async uploadImage(uri) {
    console.log("-----------------------------------------------------------");
    console.log("[EditPostModel.uploadImage] FUNCIÓN INICIADA.");
    console.log("[EditPostModel.uploadImage] URI recibida para subir:", uri);
    console.log("[EditPostModel.uploadImage] Objeto 'storage' importado de firebaseConfig:", storage);
    try {
      const timestamp = new Date().getTime();
      const imagePath = `posts/${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
      console.log("[EditPostModel.uploadImage] Path para la imagen en Storage:", imagePath);
      const imageRef = ref(storage, imagePath);
      console.log("[EditPostModel.uploadImage] 'imageRef' creada (objeto StorageReference):", imageRef);
      if (!imageRef) {
        console.error("[EditPostModel.uploadImage] ¡ERROR CRÍTICO! imageRef es undefined o null DESPUÉS de llamar a ref().");
        throw new Error("Falló la creación de imageRef o el servicio de storage no es válido.");
      }
      if (imageRef && imageRef._location === undefined) {
           console.warn("[EditPostModel.uploadImage] ADVERTENCIA: imageRef existe PERO NO tiene la propiedad interna _location.");
      } else if (imageRef) {
           console.log("[EditPostModel.uploadImage] Propiedad interna imageRef._location:", imageRef._location);
      }
      console.log("[EditPostModel.uploadImage] Intentando fetch de la URI:", uri);
      const response = await fetch(uri);
      if (!response.ok) {
        console.error("[EditPostModel.uploadImage] Falló el fetch de la URI. Status:", response.status, "StatusText:", response.statusText);
        let responseBody = "No se pudo leer el cuerpo de la respuesta.";
        try { responseBody = await response.text(); } catch (e) {}
        console.error("[EditPostModel.uploadImage] Cuerpo de la respuesta de fetch (si hubo error):", responseBody);
        throw new Error(`Failed to fetch image. Status: ${response.status}`);
      }
      const blob = await response.blob();
      console.log("[EditPostModel.uploadImage] Blob original creado. Tipo:", blob.type, "Tamaño:", blob.size);
      // Para la prueba del blob simplificado:
      // console.log("[EditPostModel.uploadImage] Creando simplifiedBlob para la prueba...");
      // const simplifiedBlob = new Blob([blob]);
      // console.log("[EditPostModel.uploadImage] simplifiedBlob creado. Tipo:", simplifiedBlob.type, "Tamaño:", simplifiedBlob.size);
      // console.log("[EditPostModel.uploadImage] Intentando uploadBytes con imageRef y simplifiedBlob...");
      // await uploadBytes(imageRef, simplifiedBlob); // USAR ESTE PARA LA PRUEBA
      await uploadBytes(imageRef, blob); // USANDO EL BLOB ORIGINAL POR DEFECTO
      console.log("[EditPostModel.uploadImage] uploadBytes completado.");
      console.log("[EditPostModel.uploadImage] Intentando getDownloadURL con imageRef:", imageRef);
      const downloadURL = await getDownloadURL(imageRef);
      console.log("[EditPostModel.uploadImage] getDownloadURL completado. URL:", downloadURL);
      console.log("-----------------------------------------------------------");
      return downloadURL;
    } catch (error) {
      console.error("-----------------------------------------------------------");
      console.error('[EditPostModel.uploadImage] ERROR DETALLADO EN CATCH de uploadImage:');
      console.error('[EditPostModel.uploadImage] Mensaje:', error.message);
      console.error('[EditPostModel.uploadImage] Código (si existe):', error.code);
      console.error('[EditPostModel.uploadImage] Objeto de error completo:', error);
      console.error("-----------------------------------------------------------");
      throw new Error('image-upload-failed');
    }
  }

  // --- COPIADO DE PostModel ---
  static getCurrentUser() {
    return auth.currentUser;
  }

  // --- COPIADO DE PostModel ---
  static getServerTimestamp() {
    return serverTimestamp();
  }

  // --- MÉTODO ESPECÍFICO PARA ACTUALIZAR POST ---
  static async updatePost(postId, dataToUpdate) {
    console.log(`[EditPostModel] updatePost llamado. PostID: ${postId}, Datos:`, dataToUpdate);
    try {
      if (!postId) {
        console.error("[EditPostModel] ID del post es requerido para actualizar.");
        throw new Error('post-id-required-for-update');
      }
      const postRef = doc(db, 'posts', postId);

      const finalDataToUpdate = { ...dataToUpdate };
      if (dataToUpdate.imageUrl === null) { // Si explícitamente se quiere borrar la imagen
          finalDataToUpdate.imageUrl = deleteField(); // Elimina el campo imageUrl del documento
          console.log("[EditPostModel] Se eliminará el campo imageUrl del post:", postId);
      } else if (dataToUpdate.imageUrl === undefined) {
          // Si imageUrl no está en dataToUpdate, no lo modificamos.
          // Para ser explícito, se puede borrar del objeto si no se quiere enviar `undefined`.
          delete finalDataToUpdate.imageUrl;
      }
      // Si imageUrl tiene una URL, se actualizará con ese valor.

      await updateDoc(postRef, finalDataToUpdate);
      console.log('[EditPostModel] Post actualizado exitosamente en Firestore:', postId);
      return true;
    } catch (error) {
      console.error('[EditPostModel] Error actualizando post en Firestore:', postId, error);
      throw new Error('post-update-failed');
    }
  }

  // --- FUNCIÓN PARA BORRAR IMAGEN DE STORAGE ---
  static async deleteImageFromStorage(imageUrl) {
    if (!imageUrl || !imageUrl.startsWith('https://firebasestorage.googleapis.com/')) {
      console.log("[EditPostModel] deleteImageFromStorage: URL inválida o no es de Firebase Storage.", imageUrl);
      return false;
    }
    try {
      // Crear referencia a partir de la URL de descarga.
      // Esto solo funciona si la URL es una URL de descarga de Firebase Storage para el bucket correcto.
      const imageRef = ref(storage, imageUrl);
      console.log("[EditPostModel] Intentando borrar imagen de Storage con ref:", imageRef.fullPath);
      await deleteObject(imageRef);
      console.log("[EditPostModel] Imagen borrada de Storage exitosamente:", imageUrl);
      return true;
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        console.warn("[EditPostModel] Intento de borrar imagen de Storage, pero no se encontró (quizás ya estaba borrada o la URL no era exacta):", imageUrl);
      } else {
        console.error("[EditPostModel] Error borrando imagen de Storage:", imageUrl, error);
      }
      return false; // No relanzamos el error para no detener el flujo de actualización del post, pero logueamos.
    }
  }
}