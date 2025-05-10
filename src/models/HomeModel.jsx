import { db } from '../../firebaseConfig';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc,
  where 
} from 'firebase/firestore';

export default class HomeModel {
  /**
   * Obtiene publicaciones en tiempo real con filtro opcional por usuario
   * @param {function} callback - Función que recibe los datos
   * @param {string} [userId] - ID de usuario para filtrar (opcional)
   * @returns {function} Función para cancelar la suscripción
   */
  static fetchPublicacionesEnTiempoReal(callback, userId = null) {
    let q;
    
    if (userId) {
      // Filtra solo publicaciones del usuario especificado
      q = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Obtiene todas las publicaciones
      q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const publicaciones = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Normaliza fechas de Firebase Timestamp a JavaScript Date
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
        }));
        callback(publicaciones);
      },
      (error) => {
        console.error("Error en tiempo real:", error);
        callback([], error); // Envía array vacío y error
      }
    );

    return unsubscribe;
  }

  /**
   * Elimina una publicación
   * @param {string} postId - ID de la publicación a eliminar
   * @returns {Promise<void>}
   */
  static async deletePost(postId) {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      console.log("Publicación eliminada:", postId);
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
      throw error;
    }
  }

  /**
   * Obtiene publicaciones de un usuario específico
   * @param {string} userId - ID del usuario
   * @param {function} callback - Función callback
   * @returns {function} Función para cancelar suscripción
   */
  static fetchUserPosts(userId, callback) {
    return this.fetchPublicacionesEnTiempoReal(callback, userId);
  }
}