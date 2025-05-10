import PostModel from '../models/PostModel';

export default class PostPresenter {
  constructor(view) {
    this.view = view;
  }

  async submitPost(formData) {
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
      const user = PostModel.getCurrentUser();
      if (!user) {
        this.view.showError('Debes iniciar sesión para publicar');
        return;
      }

      let imageUrl = '';
      if (imageUri) {
        try {
          imageUrl = await PostModel.uploadImage(imageUri);
        } catch (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          throw new Error('image-upload-failed');
        }
      }

      await PostModel.createPost({
        title,
        price: numericPrice, // Usamos el precio convertido
        location,
        description,
        userId: user.uid,
        imageUrl,
        contacto,
        createdAt: new Date() // Fecha de creación
      });

      this.view.onSuccess();
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    const errorMap = {
      // Firebase Errors
      'auth/network-request-failed': 'Error de conexión',
      'storage/object-not-found': 'Imagen no encontrada',
      
      // Custom Errors
      'image-upload-failed': 'Error al subir la imagen',
      'post-creation-failed': 'Error al publicar',
      
      // Default
      'default': 'Ocurrió un error. Intenta nuevamente'
    };

    const code = error.code || error.message || 'default';
    const message = errorMap[code] || errorMap['default'];
    
    console.error('Error:', error); // Para depuración
    this.view.showError(message);
  }
}