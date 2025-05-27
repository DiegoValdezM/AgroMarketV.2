// src/models/PostModel.js
import { db, storage, auth } from '../../firebaseConfig'; // Esta importación es clave
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default class PostModel {
  /**
   * Sube una imagen a Firebase Storage
   * @param {string} uri - URI local de la imagen
   * @returns {Promise<string>} URL pública de la imagen
   */
  static async uploadImage(uri) {
    // ----- INICIO DE VERIFICACIÓN IMPORTANTE -----
    console.log("[PostModel.uploadImage] VERIFICANDO 'storage' (importado):", storage);
    // ----- FIN DE VERIFICACIÓN IMPORTANTE -----

    if (!storage) { // Comprobación explícita
      console.error("[PostModel.uploadImage] ¡ERROR CRÍTICO: La instancia 'storage' importada es undefined o null!");
      console.error("[PostModel.uploadImage] Revisa tu archivo '../../firebaseConfig.js' y asegúrate de que 'storage' se inicializa y exporta correctamente.");
      throw new Error('firebase-storage-not-initialized');
    }

    try {
      // 1. Crear referencia única para la imagen
      const timestamp = new Date().getTime();
      const nombreImagen = `posts/${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
      
      const imageRef = ref(storage, nombreImagen); // 'storage' DEBE ser válido aquí

      // ----- INICIO DE VERIFICACIÓN DE imageRef -----
      console.log("[PostModel.uploadImage] VERIFICANDO 'imageRef' (resultado de ref()):", imageRef);
      if (!imageRef || typeof imageRef.bucket === 'undefined' || typeof imageRef.fullPath === 'undefined') {
        console.error("[PostModel.uploadImage] ¡ERROR CRÍTICO: 'imageRef' no es una referencia de Storage válida!", imageRef);
        console.error("[PostModel.uploadImage] Esto puede pasar si 'storage' era inválido o la ruta es incorrecta de forma severa.");
        throw new Error('invalid-storage-reference');
      }
      console.log(`[PostModel.uploadImage] Intentando subir a: gs://${imageRef.bucket}/${imageRef.fullPath}`);
      // ----- FIN DE VERIFICACIÓN DE imageRef -----
      
      // 2. Convertir URI a blob
      const response = await fetch(uri);
      if (!response.ok) {
        const errorText = await response.text(); // Obtener más detalles del error de fetch
        console.error(`[PostModel.uploadImage] Falló fetch para la imagen URI: ${uri}. Status: ${response.status}. Respuesta: ${errorText}`);
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();
      console.log(`[PostModel.uploadImage] Blob creado. Tipo: ${blob.type}, Tamaño: ${blob.size}`);
      
      // 3. Subir a Firebase Storage
      console.log("[PostModel.uploadImage] Intentando uploadBytes...");
      await uploadBytes(imageRef, blob); // Si imageRef es malo, esto fallará con el error _location
      console.log("[PostModel.uploadImage] uploadBytes completado exitosamente.");
      
      // 4. Obtener URL pública
      console.log("[PostModel.uploadImage] Intentando getDownloadURL...");
      const downloadURL = await getDownloadURL(imageRef); // También necesita un imageRef válido
      console.log("[PostModel.uploadImage] getDownloadURL exitoso:", downloadURL);
      
      return downloadURL;

    } catch (error) {
      console.error('[PostModel.uploadImage] Error durante la subida de imagen:', error);
      // Si el error es uno de los que lanzamos explícitamente, relánzalo.
      if (error.message === 'firebase-storage-not-initialized' || error.message === 'invalid-storage-reference' || error.message === 'Failed to fetch image') {
        throw error;
      }
      // Para otros errores (incluido el TypeError original si las comprobaciones fallan), lanza el genérico.
      throw new Error('image-upload-failed');
    }
  }

  /**
   * Crea un nuevo post en Firestore
   * @param {object} postData - Datos del post
   * (El resto de tus campos JSDoc están bien)
   */
  static async createPost(postData) {
    try {
      // Validación básica de datos requeridos
      if (!postData.userId) {
        console.error("[PostModel.createPost] Error: userId es requerido.");
        throw new Error('user-id-required');
      }
      
      const postWithMetadata = {
        ...postData,
        createdAt: serverTimestamp(), // Correcto
        status: 'active', 
        views: 0 
      };

      const docRef = await addDoc(collection(db, 'posts'), postWithMetadata);
      console.log('[PostModel.createPost] Post creado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[PostModel.createPost] Error creando post:', error);
      // Podrías querer ser más específico con los errores de Firestore aquí si es necesario
      throw new Error('post-creation-failed');
    }
  }

  /**
   * Obtiene el usuario actual autenticado
   * @returns {import('firebase/auth').User|null}
   */
  static getCurrentUser() {
    // No es necesario un try-catch aquí, auth.currentUser es síncrono y no lanza errores.
    // Simplemente devuelve null si no hay usuario.
    if (!auth) {
        console.warn("[PostModel.getCurrentUser] La instancia 'auth' no está inicializada. Revisa firebaseConfig.js.");
        return null;
    }
    return auth.currentUser;
  }
}