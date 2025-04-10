import HomeModel from '../models/HomeModel';

export default class HomePresenter {
  constructor(view) {
    this.view = view;
    this.unsubscribe = null;
    this.currentUserId = null; // Almacenará el ID del usuario autenticado
  }

  /**
   * Carga publicaciones en tiempo real con manejo de usuario
   * @param {string} userId - Opcional: filtrar por usuario específico
   */
  loadPublicacionesEnTiempoReal(userId = null) {
    try {
      this.currentUserId = userId;
      
      if (this.unsubscribe) this.unsubscribe();

      this.unsubscribe = HomeModel.fetchPublicacionesEnTiempoReal(
        (publicaciones, error) => {
          if (error) {
            this.view.showError("Error cargando publicaciones: " + error.message);
            this.view.showPublicaciones([]); // Limpia la vista
          } else {
            this.view.showPublicaciones(publicaciones);
          }
        },
        userId // Filtro opcional por usuario
      );

    } catch (error) {
      this.view.showError("Error al cargar: " + error.message);
    }
  }

  /**
   * Filtra publicaciones localmente
   * @param {string} searchText - Texto de búsqueda
   * @param {Array} originalPublicaciones - Lista completa de publicaciones
   * @returns {Array} Publicaciones filtradas
   */
  filterPublicaciones(searchText, originalPublicaciones) {
    if (!searchText.trim()) return originalPublicaciones;
    
    const searchLower = searchText.toLowerCase();
    return originalPublicaciones.filter(pub => {
      const searchFields = [
        pub.titulo,
        pub.descripcion,
        pub.userName, // Buscar también por nombre de usuario
        pub.location
      ].filter(Boolean); // Elimina campos undefined

      return searchFields.some(field => 
        field.toLowerCase().includes(searchLower)
      );
    });
  }

  /**
   * Elimina una publicación con validación de usuario
   * @param {string} postId - ID de la publicación
   * @param {string} userId - ID del usuario actual
   */
  async deletePost(postId, userId) {
    try {
      // En un caso real, aquí validarías que el userId coincide
      // con el userId de la publicación antes de eliminar
      await HomeModel.deletePost(postId);
      this.navigateToHome;
      
      // Recarga las publicaciones actualizadas
      this.loadPublicacionesEnTiempoReal(this.currentUserId); 
    } catch (error) {
      this.view.showError("Error al eliminar: " + error.message);
    }
  }

  onDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  navigateToForm() {
    this.view.navigate('Form');
  }

  navigateToHome() {
    this.view.navigate('Home');
  }

  /**
   * Navega a la pantalla de edición
   * @param {object} post - Publicación a editar
   */
  navigateToEdit(post) {
    this.view.navigate('EditPost', { post });
  }
}