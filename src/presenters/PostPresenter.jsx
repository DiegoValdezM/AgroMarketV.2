// PostPresenter.jsx (Modificado)
import PostModel from '../models/PostModel';
import { db } from '../../firebaseConfig'; // Importa la instancia de db de Firestore
import { doc, getDoc } from 'firebase/firestore'; // Importa las funciones necesarias de Firestore

export default class PostPresenter {
  constructor(view) {
    this.view = view; // La vista debe implementar showError(message) y onSuccess(message)
  }

  async submitPost(formData) {
    console.log("[PostPresenter] submitPost llamado. FormData:", JSON.stringify(formData, null, 2));

    const { title, price, location, description, contacto, imageUri } = formData;

    // Validaciones
    if (!title || !location || !description) {
      this.view.showError('Título, ubicación y descripción son obligatorios');
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      this.view.showError('Ingrese un precio válido');
      return;
    }

    try {
      const user = PostModel.getCurrentUser();
      if (!user) {
        this.view.showError('Debes iniciar sesión para publicar');
        return;
      }
      console.log("[PostPresenter] Usuario autenticado:", user.uid);

      let imageUrl = null;

      if (imageUri) {
        console.log("[PostPresenter] Subiendo imagen...");
        imageUrl = await PostModel.uploadImage(imageUri);
        console.log("[PostPresenter] Imagen subida con éxito. URL:", imageUrl);
      } else {
        console.log("[PostPresenter] No se proporcionó una imagen.");
      }

      // --- CAMBIO CLAVE AQUÍ ---
      // 1. Obtener la información del perfil del usuario desde Firestore
      let userProfileName = `Usuario ${user.uid.substring(0, 6)}`; // Fallback por defecto
      let userProfilePhoto = null; // Fallback por defecto

      const userDocRef = doc(db, 'users', user.uid); // Asume que tu colección de usuarios es 'users' y el ID del documento es el UID
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        // Asegúrate de que 'usuario' sea el campo donde guardas el nombre en Firestore
        userProfileName = userData.usuario || userProfileName; 
        // Si también guardas la foto de perfil en Firestore, úsala
        userProfilePhoto = userData.photoURL || userProfilePhoto; 
      } else {
        console.warn(`[PostPresenter] Documento de usuario no encontrado para UID: ${user.uid}`);
      }
      // --- FIN CAMBIO CLAVE ---


      const postData = {
        title,
        price: numericPrice,
        location,
        description,
        contacto,
        imageUrl,
        userId: user.uid,
        userName: userProfileName, // Usamos el nombre obtenido de Firestore
        userPhoto: userProfilePhoto, // Usamos la foto obtenida de Firestore
      };

      console.log("[PostPresenter] Guardando post en Firestore:", JSON.stringify(postData, null, 2));

      const postId = await PostModel.createPost(postData);

      console.log("[PostPresenter] Post creado. ID:", postId);
      this.view.onSuccess('¡Publicación creada exitosamente!');
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    const errorMap = {
      'auth/network-request-failed': 'Error de conexión',
      'storage/object-not-found': 'Imagen no encontrada',
      'image-upload-failed': 'Error al subir la imagen',
      'post-creation-failed': 'Error al crear la publicación',
      'user-id-required': 'Error interno: Falta el ID de usuario',
      'default': 'Ocurrió un error inesperado',
    };

    const errorCode = ['image-upload-failed', 'post-creation-failed', 'user-id-required'].includes(error.message)
      ? error.message
      : error.code || 'default';

    const message = errorMap[errorCode] || errorMap.default;

    console.error(`[PostPresenter] Error: ${message}`, error);
    this.view.showError(message);
  }
}