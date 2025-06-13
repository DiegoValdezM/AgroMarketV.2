import { db, auth } from '../../firebaseConfig'; // Asegúrate de importar 'auth'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore';
import HomeModel from '../models/HomeModel'; // Tu HomeModel existente

export default class HomePresenter {
  constructor(view, navigation) {
    this.view = view;
    this.navigation = navigation; // La navegación se pasa desde la vista
    this.unsubscribe = null;
    this.currentUserRole = null; // Almacenará el rol del usuario actual

    // Asegurarse de que 'this' esté correctamente enlazado para callbacks
    this.checkAdminRole = this.checkAdminRole.bind(this);
  }

  // Método para verificar el rol del usuario autenticado
  async checkAdminRole() {
    const user = auth.currentUser;
    if (user) {
      try {
        // MUY IMPORTANTE: Asegúrate que 'usuarios' es el nombre exacto de tu colección de usuarios
        // donde guardas el campo 'role'.
        const userDocRef = doc(db, 'usuarios', user.uid); 
        console.log(`[HomePresenter] Intentando obtener documento de usuario para UID: ${user.uid} en colección 'usuarios'`);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // Asegura que 'role' es el nombre exacto del campo que guarda el rol.
          this.currentUserRole = userData.role || 'user'; 
          console.log("[HomePresenter] Rol del usuario encontrado en Firestore:", this.currentUserRole);
          // Informar a la vista si el usuario es administrador
          if (this.view.setAdminStatus) {
              this.view.setAdminStatus(this.currentUserRole === 'admin');
          }
        } else {
          console.log("[HomePresenter] Documento de usuario NO encontrado en Firestore con el UID proporcionado en la colección 'usuarios'. Asumiendo rol 'user'.");
          this.currentUserRole = 'user';
          if (this.view.setAdminStatus) {
              this.view.setAdminStatus(false);
          }
        }
      } catch (error) {
        console.error("Error al obtener el rol del usuario desde Firestore:", error);
        this.currentUserRole = 'user';
        if (this.view.setAdminStatus) {
            this.view.setAdminStatus(false);
        }
      }
    } else {
      this.currentUserRole = null;
      if (this.view.setAdminStatus) {
          this.view.setAdminStatus(false);
      }
    }
  }

  /**
   * Carga publicaciones en tiempo real con manejo de usuario y verificación de rol.
   * @param {string} userId - Opcional: filtrar por usuario específico (no usado actualmente para la pantalla principal)
   */
  async loadPublicacionesEnTiempoReal(userId = null) {
    this.view.setLoading(true); // Indicar que la carga ha comenzado

    // Primero, verificamos el rol del usuario actual
    await this.checkAdminRole();

    try {
      this.currentUserId = userId; // Guarda el ID del usuario actual si se filtra

      if (this.unsubscribe) this.unsubscribe(); // Detener el listener anterior si existe

      this.unsubscribe = onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')), async (snapshot) => {
        const publicacionPromises = snapshot.docs.map(async (docFirebase) => {
          const publicacionData = docFirebase.data();
          const postUserId = publicacionData.userId; // Renombrar para evitar conflicto con 'userId' de filtro

          let userName = 'Usuario Desconocido';
          let userPhoto = null;
          let userEmail = null; 

          if (postUserId) {
            // Consulta la información del usuario desde la colección 'usuarios'
            const userDoc = await getDoc(doc(db, 'usuarios', postUserId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              // Asegúrate que 'usuario' sea el nombre de tu campo de nombre y 'photoURL' para la foto
              userName = userData.usuario || 'Usuario Desconocido';
              userPhoto = userData.photoURL || null;
              userEmail = userData.correo || null;
            }
          }

          return {
            id: docFirebase.id,
            ...publicacionData,
            userName: userName,
            userPhoto: userPhoto,
            userEmail: userEmail,
          };
        });

        const publicacionList = await Promise.all(publicacionPromises);
        this.view.showPublicaciones(publicacionList);
      }, (error) => {
        console.error("Error al cargar publicaciones en tiempo real:", error);
        this.view.showError('Error al cargar publicaciones. ' + error.message);
      });

    } catch (error) {
      this.view.showError("Error al iniciar carga: " + error.message);
      this.view.setLoading(false); // Asegúrate de quitar el loading en caso de error inicial
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
        pub.title, 
        pub.description,
        pub.userName,
        pub.location
      ].filter(Boolean);

      return searchFields.some(field =>
        field.toLowerCase().includes(searchLower)
      );
    });
  }

  /**
   * Elimina una publicación.
   * @param {string} postId - ID de la publicación
   */
  async deletePost(postId) {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error al eliminar post:', error);
      throw new Error('No se pudo eliminar la publicación.');
    }
  }

  onDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  navigateToForm() {
    if (this.navigation) {
      this.navigation.navigate('Form');
    } else {
      console.warn("Navegación no disponible en HomePresenter para 'Form'.");
    }
  }

  navigateToUsersManagement() {
    if (this.navigation) {
      this.navigation.navigate('Admin');
    } else {
      console.warn("Navegación no disponible en HomePresenter para 'Admin'.");
    }
  }

  // ESTA ES LA FUNCIÓN QUE PREGUNTABAS
  navigateToEditProfile() {
    if (this.navigation) {
      this.navigation.navigate('EditProfile'); // Asegúrate que 'EditProfile' es el nombre de la ruta
    } else {
      console.warn("Navegación no disponible en HomePresenter para 'EditProfile'.");
    }
  }

  /**
   * Navega a la pantalla de edición.
   * @param {object} post - Publicación a editar
   */
  navigateToEdit(post) {
    if (this.navigation) {
      this.navigation.navigate('EditPost', { post });
    } else {
      console.warn("Navegación no disponible en HomePresenter para 'EditPost'.");
    }
  }
}
