import { db, storage, auth } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default class PostModel {
  /**
   * Sube una imagen a Firebase Storage
   * @param {string} uri - URI local de la imagen
   * @returns {Promise<string>} URL pública de la imagen
   */
  static async uploadImage(uri) {
    try {
      // 1. Crear referencia única para la imagen
      const timestamp = new Date().getTime();
      const imageRef = ref(storage, `posts/${timestamp}_${Math.random().toString(36).substring(2, 8)}`);
      
      // 2. Convertir URI a blob
      const response = await fetch(uri);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      
      // 3. Subir a Firebase Storage
      await uploadBytes(imageRef, blob);
      
      // 4. Obtener URL pública
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('image-upload-failed');
    }
  }

  /**
   * Crea un nuevo post en Firestore
   * @param {object} postData - Datos del post
   * @param {string} postData.title - Título del post
   * @param {number} postData.price - Precio del producto
   * @param {string} postData.location - Ubicación
   * @param {string} postData.description - Descripción
   * @param {string} postData.contacto - contacto
   * @param {string} postData.userId - ID del usuario creador
   * @param {string} [postData.imageUrl] - URL de la imagen (opcional)
   */
  static async createPost(postData) {
    try {
      // Validación básica de datos requeridos
      if (!postData.userId) throw new Error('user-id-required');
      
      const postWithMetadata = {
        ...postData,
        createdAt: serverTimestamp(), // Mejor que new Date()
        status: 'active', // Estado por defecto
        views: 0 // Contador de vistas
      };

      const docRef = await addDoc(collection(db, 'posts'), postWithMetadata);
      console.log('Post creado con ID:', docRef.id);
      return docRef.id; // Retornamos el ID del nuevo documento
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('post-creation-failed');
    }
  }

  /**
   * Obtiene el usuario actual autenticado
   * @returns {import('firebase/auth').User|null}
   */
  static getCurrentUser() {
    try {
      return auth.currentUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}