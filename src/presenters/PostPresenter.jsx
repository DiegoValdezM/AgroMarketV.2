// PostPresenter.jsx
import PostModel from '../models/PostModel';
import { Alert } from 'react-native'; // Asumo que usas Alert en la vista, pero el presenter podría usarlo para debug

export default class PostPresenter {
  constructor(view) {
    this.view = view; // 'view' debe tener los métodos showError y onSuccess
  }

  async submitPost(formData) {
    // --- CONSOLE.LOG: DATOS RECIBIDOS DEL FORMULARIO ---
    console.log("[PostPresenter] submitPost llamado. formData recibida:", JSON.stringify(formData, null, 2));
    const { title, price, location, description, contacto, imageUri } = formData;

    // Validaciones mejoradas
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
      // this.view.showLoading(); // Si tienes un indicador de carga en la vista

      const user = PostModel.getCurrentUser();
      if (!user) {
        console.error("[PostPresenter] Error: Usuario no autenticado al intentar publicar.");
        this.view.showError('Debes iniciar sesión para publicar');
        return;
      }
      // --- CONSOLE.LOG: DATOS DEL USUARIO AUTENTICADO ---
      console.log("[PostPresenter] Usuario autenticado:", user.uid);
      console.log("[PostPresenter] user.displayName:", user.displayName); // <--- LOG IMPORTANTE
      console.log("[PostPresenter] user.photoURL:", user.photoURL);     // <--- LOG IMPORTANTE

      let finalImageUrl = null; // Inicializar como null
      if (imageUri) {
        // --- CONSOLE.LOG: INTENTANDO SUBIR IMAGEN ---
        console.log("[PostPresenter] Hay imageUri, intentando subir imagen:", imageUri);
        try {
          finalImageUrl = await PostModel.uploadImage(imageUri);
          // --- CONSOLE.LOG: IMAGEN SUBIDA EXITOSAMENTE ---
          console.log("[PostPresenter] Imagen subida. URL obtenida:", finalImageUrl);
        } catch (uploadError) {
          console.error('[PostPresenter] Falló la llamada a PostModel.uploadImage. Error:', uploadError);
          // Propagar el error para que lo maneje el catch principal y luego handleError
          throw uploadError; 
        }
      } else {
        // --- CONSOLE.LOG: NO HAY IMAGEN URI ---
        console.log("[PostPresenter] No se proporcionó imageUri. Se creará el post sin imagen.");
      }

      // --- Preparamos los datos para guardar, incluyendo la información del autor ---
      const postDataToSave = {
        title,
        price: numericPrice, // Usamos el precio convertido
        location,
        description,
        userId: user.uid,    // ID del usuario que crea el post
        imageUrl: finalImageUrl, // URL de la imagen subida (o null si no hay)
        contacto,
        // Datos del autor para mostrar en la publicación:
        userName: user.displayName || `Usuario ${user.uid.substring(0, 6)}`, // Nombre para mostrar del usuario
                                                                            // Usa el displayName de Firebase Auth, o un fallback.
        userPhoto: user.photoURL || null,  // URL de la foto de perfil del usuario (de Firebase Auth)
      };
      // --- CONSOLE.LOG: DATOS FINALES PARA CREAR POST ---
      // ESTE LOG ES CLAVE PARA VER QUÉ SE VA A GUARDAR
      console.log("[PostPresenter] Intentando crear post en Firestore con datos:", JSON.stringify(postDataToSave, null, 2)); 

      const postId = await PostModel.createPost(postDataToSave);

      // --- CONSOLE.LOG: POST CREADO ---
      console.log("[PostPresenter] Post creado exitosamente en Firestore. ID del Post:", postId);

      this.view.onSuccess('¡Publicación creada exitosamente!'); // Llama al callback onSuccess de la vista
    } catch (error) {
      // --- CONSOLE.LOG: ERROR GENERAL EN submitPost ---
      console.error("[PostPresenter] Error en el bloque try/catch principal de submitPost:", error.message);
      this.handleError(error);
    } finally {
      // this.view.hideLoading(); // Si tienes un indicador de carga
    }
  }

  handleError(error) {
    const errorMap = {
      // Firebase Errors
      'auth/network-request-failed': 'Error de conexión',
      'storage/object-not-found': 'Imagen no encontrada',
      
      // Custom Errors (de PostModel o de este Presenter)
      'image-upload-failed': 'Error al subir la imagen. Intenta de nuevo.',
      'post-creation-failed': 'Error al crear la publicación. Intenta de nuevo.',
      'user-id-required': 'Error interno: Falta el ID de usuario.',
      
      // Default
      'default': 'Ocurrió un error inesperado. Intenta nuevamente.'
    };

    const errorCode = error.message === 'image-upload-failed' || 
                      error.message === 'post-creation-failed' ||
                      error.message === 'user-id-required'
        ? error.message
        : error.code || 'default';

    const messageToDisplay = errorMap[errorCode] || errorMap['default'];
    
    console.error('[PostPresenter] handleError ejecutado. Código de error mapeado:', errorCode, 'Mensaje original:', error.message, 'Error completo:', error);
    this.view.showError(messageToDisplay);
  }
}