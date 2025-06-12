import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList
} from 'react-native';
import HomePresenter from '../../presenters/HomePresenter';
import Publicacion from '../../components/Publicaciones';
import HomeStyles from '../../styles/homeStyle'; // Tus estilos existentes para publicaciones, etc.

// IMPORTACIONES PARA EL CHAT Y NOTIFICACIONES
import { ChatContext } from '../../context/chat';
import NotificationItem from '../../components/NotificacionesItem';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true); // Loading para las publicaciones
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([]);
  const [originalPublicaciones, setOriginalPublicaciones] = useState([]);
  // Nuevo estado para controlar si el usuario es administrador
  const [isAdmin, setIsAdmin] = useState(false);

  // OBTENER DATOS Y FUNCIONES DEL CHATCONTEXT
  const {
    notifications,
    selectChat,
    addDemoNotification,
    usersList,
    fetchUsers
  } = useContext(ChatContext);

  // Creamos la instancia del Presentador y le pasamos los métodos de la Vista y la navegación
  const [presenter] = useState(new HomePresenter({
    showPublicaciones: (data) => {
      setOriginalPublicaciones(data);
      setFilteredPublicaciones(data);
      setLoading(false); // Solo para la carga de publicaciones
    },
    showError: (message) => {
      setError(message);
      setLoading(false); // Solo para la carga de publicaciones
    },
    navigate: (screen) => navigation.navigate(screen),
    // Nuevo método para que el Presentador informe a la Vista sobre el estado de admin
    setAdminStatus: (status) => setIsAdmin(status),
    setLoading: (status) => setLoading(status) // Pasar setLoading para que el presentador maneje el estado de carga general
  }, navigation)); // Asegúrate de pasar 'navigation' aquí

  useEffect(() => {
    // Al montar el componente, cargamos las publicaciones y verificamos el rol del usuario
    presenter.loadPublicacionesEnTiempoReal();

    // Cargar usuarios si no se han cargado, para el botón de demo de notificaciones
    if (fetchUsers && (!usersList || usersList.length === 0)) {
      fetchUsers();
    }
    // Función de limpieza para desuscribirse del listener de publicaciones
    return () => presenter.onDestroy();
  }, [presenter, fetchUsers, usersList, navigation]);

  const handleDelete = async (postId) => {
    try {
      await presenter.deletePost(postId);
      Alert.alert('Éxito', 'Publicación eliminada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar: ' + error.message);
    }
  };

  const handleEdit = (post) => {
    navigation.navigate('EditPost', { post });
  };

  const handleNavigateToChatSelection = () => {
    navigation.navigate('ChatSelection');
  };

  // FUNCIÓN PARA MANEJAR CLIC EN UNA NOTIFICACIÓN
  const handleNotificationPress = (notification) => {
    if (notification.partner && notification.chatRoomId) {
      console.log("[HomeScreen] Abriendo chat desde notificación:", notification.chatRoomId);
      selectChat(notification.partner);
      navigation.navigate('Chat');
    } else {
      console.warn("Notificación inválida, falta partner o chatRoomId:", notification);
      Alert.alert("Error", "No se puede abrir esta notificación.");
    }
  };

  // FUNCIÓN PARA DISPARAR UNA NOTIFICACIÓN DE DEMO
  const triggerDemoNotification = () => {
    if (addDemoNotification) {
      if (usersList && usersList.length > 0) {
        const demoPartner = usersList[Math.floor(Math.random() * usersList.length)];
        if (demoPartner && demoPartner.authUid) {
          addDemoNotification(
            { uid: demoPartner.authUid, displayName: demoPartner.nombre, email: demoPartner.correo },
            `¡Mensaje de ${demoPartner.nombre || demoPartner.email}!`
          );
        } else {
          Alert.alert("Demo", "No se pudo seleccionar un usuario válido para la notificación demo.");
        }
      } else {
        addDemoNotification(
            { uid: "demoAuthUserUID", displayName: "Usuario Demo", email: "demo@example.com"},
            "¡Este es un mensaje de prueba de notificación!"
        );
        console.warn("[HomeScreen] No hay usuarios en usersList para generar notificación demo realista. Usando datos genéricos.");
        if (!usersList || usersList.length === 0) fetchUsers();
      }
    } else {
        console.error("addDemoNotification no está disponible en ChatContext");
    }
  };

  if (loading) return <ActivityIndicator style={styles.centeredLoader} size="large" color="#8a5c9f" />;
  if (error) return <Text style={[HomeStyles.errorText, styles.centeredError]}>{error}</Text>;

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={HomeStyles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header con buscador y botón de nueva publicación */}
        <View style={HomeStyles.header}>
          <TextInput
            style={HomeStyles.searchBar}
            placeholder="Buscar proveedor, fruta, cliente..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              const filtered = presenter.filterPublicaciones(text, originalPublicaciones);
              setFilteredPublicaciones(filtered);
            }}
          />
          <TouchableOpacity
            style={HomeStyles.addButton}
            onPress={() => presenter.navigateToForm()}
          >
            <Text style={HomeStyles.addButtonText}>+ Nueva</Text>
          </TouchableOpacity>
        </View>

        {/* Botón de ADMINISTRACIÓN (SOLO VISIBLE SI ES ADMIN) */}
        {isAdmin && (
          <TouchableOpacity
            style={[HomeStyles.addButton, styles.adminButton]}
            onPress={() => presenter.navigateToUsersManagement()}
          >
            <Text style={HomeStyles.addButtonText}>Gestionar Usuarios</Text>
          </TouchableOpacity>
        )}

        {/* SECCIÓN DE NOTIFICACIONES DE CHAT */}
        <View style={HomeStyles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={HomeStyles.sectionTitle}>Nuevos Mensajes</Text>
            <TouchableOpacity onPress={triggerDemoNotification} style={styles.demoButton}>
                <Text style={styles.demoButtonText}>+ Notif Demo</Text>
            </TouchableOpacity>
          </View>
          {notifications && notifications.length > 0 ? (
            <View style={styles.notificationsListContainer}>
              {notifications.map(item => (
                   <NotificationItem
                      key={item.id.toString()}
                      notification={item}
                      onPress={() => handleNotificationPress(item)}
                    />
              ))}
            </View>
          ) : (
            <Text style={HomeStyles.emptyText ?? styles.emptyNotificationText}>No tienes mensajes nuevos.</Text>
          )}
        </View>

        {/* Sección de publicaciones */}
        <View style={HomeStyles.section}>
          <View style={HomeStyles.sectionHeader}>
            <Text style={HomeStyles.sectionTitle}>Publicaciones Recientes</Text>
            {searchText && (
              <Text style={HomeStyles.resultsText}>
                {filteredPublicaciones.length} resultados
              </Text>
            )}
          </View>

          {filteredPublicaciones.length > 0 ? (
            filteredPublicaciones.map((pub) => (
              <Publicacion
                key={pub.id}
                publicacion={pub}
                onDelete={() => handleDelete(pub.id)}
                onEdit={() => handleEdit(pub)}
              />
            ))
          ) : searchText ? (
            <View style={HomeStyles.emptyState}>
              <Text style={HomeStyles.emptyText}>No hay resultados para "{searchText}"</Text>
            </View>
          ) : (
            <View style={HomeStyles.emptyState}>
              <Text style={HomeStyles.emptyText}>No hay publicaciones disponibles</Text>
              <TouchableOpacity
                style={HomeStyles.ctaButton}
                onPress={() => presenter.navigateToForm()}
              >
                <Text style={HomeStyles.ctaButtonText}>Crear primera publicación</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botón Flotante para Chat */}
      <TouchableOpacity
        style={styles.chatFab}
        onPress={handleNavigateToChatSelection}
        activeOpacity={0.7}
      >
        <Text style={styles.chatFabIcon}>💬</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredError: {
    textAlign: 'center',
    marginTop: 50,
    color: 'red',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  demoButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  demoButtonText: {
    fontSize: 12,
    color: '#333'
  },
  notificationsListContainer: {
    // Estilos para el contenedor de la lista de notificaciones si es necesario
  },
  emptyNotificationText: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#666',
  },
  chatFab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8a5c9f',
    justifyContent: 'center',
    alignItems: 'center',
    right: 20,
    bottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chatFabIcon: {
    fontSize: 24,
    color: '#fff',
  },
  // Estilo específico para el botón de administración
  adminButton: {
    marginTop: 10,
    backgroundColor: '#3498db',
    alignSelf: 'center',
    width: '90%',
    paddingVertical: 12,
    marginBottom: 10,
  }
});