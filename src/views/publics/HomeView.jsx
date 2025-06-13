import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
  Image
} from 'react-native';
import HomePresenter from '../../presenters/HomePresenter';
import Publicacion from '../../components/Publicaciones';
import HomeStyles from '../../styles/homeStyle';

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

import { ChatContext } from '../../context/chat';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([]);
  const [originalPublicaciones, setOriginalPublicaciones] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const { currentUser, userProfile } = useAuth();

  const { activeChatsList, usersList, fetchUsers } = useContext(ChatContext);

  const totalUnreadMessages = useMemo(() => {
    return activeChatsList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
  }, [activeChatsList]);


  const [presenter] = useState(new HomePresenter({
    showPublicaciones: (data) => {
      setOriginalPublicaciones(data);
      setFilteredPublicaciones(data);
      setLoading(false);
    },
    showError: (message) => {
      setError(message);
      setLoading(false);
    },
    navigate: (screen) => navigation.navigate(screen),
    setAdminStatus: (status) => setIsAdmin(status),
    setLoading: (status) => setLoading(status)
  }, navigation));

  useEffect(() => {
    presenter.loadPublicacionesEnTiempoReal();

    if (fetchUsers && (!usersList || usersList.length === 0)) {
      fetchUsers();
    }
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

  if (loading) return <ActivityIndicator style={styles.centeredLoader} size="large" color="#8a5c9f" />;
  if (error) return <Text style={[HomeStyles.errorText, styles.centeredError]}>{error}</Text>;

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={HomeStyles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* BOTÓN DE ADMINISTRACIÓN (SOLO VISIBLE SI ES ADMIN) */}
        {isAdmin && (
          <TouchableOpacity
            style={[HomeStyles.addButton, styles.adminButtonTop]}
            onPress={() => presenter.navigateToUsersManagement()}
          >
            <Text style={HomeStyles.addButtonText}>Gestionar Usuarios</Text>
          </TouchableOpacity>
        )}

        {/* SECCIÓN SUPERIOR: Info de Usuario (Izquierda) y Botones (Derecha) */}
        <View style={styles.topHeaderSection}>
          {/* Información del Usuario (Foto y Nombre) */}
          {currentUser && userProfile && (
            <View style={styles.userProfileSummary}>
              <Image
                source={userProfile.photoURL ? { uri: userProfile.photoURL } : require('../../../assets/profile-icon.webp')}
                style={styles.profileImageSmall}
              />
              <Text style={styles.userNameSummary} numberOfLines={1} ellipsizeMode="tail">
                {userProfile.nombre || 'Mi Perfil'}
              </Text>
            </View>
          )}

          {/* Contenedor de Botones (Notificaciones y Ajustes) */}
          <View style={styles.headerButtonsContainer}>
            {/* BOTÓN DE NOTIFICACIONES/MENSAJES SIN LEER */}
            <TouchableOpacity
              style={styles.notificationsButton}
              onPress={handleNavigateToChatSelection}
            >
              <Text style={styles.notificationsButtonText}>Notificaciones</Text>
              {totalUnreadMessages > 0 && (
                <View style={styles.unreadCountBadge}>
                  <Text style={styles.unreadCountText}>{totalUnreadMessages}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* ÍCONO DE AJUSTES/CONFIGURACIÓN (SOLO SI EL USUARIO ESTÁ LOGUEADO) */}
            {currentUser && (
              <TouchableOpacity
                style={styles.settingsIcon}
                onPress={() => presenter.navigateToEditProfile()}
              >
                <Ionicons name="settings-outline" size={24} color="#555" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* HEADER CON BUSCADOR Y BOTÓN DE NUEVA PUBLICACIÓN */}
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

      {/* Botón Flotante para Chat (Considera si este es redundante ahora) */}
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
    backgroundColor: '#f5f5f5',
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
  topHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 15,
    width: '100%',
  },
  userProfileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  profileImageSmall: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 8,
    backgroundColor: '#ddd',
  },
  userNameSummary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 3,
  },
  unreadCountBadge: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 3,
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  settingsIcon: {
    padding: 5,
    marginLeft: 5,
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
  adminButtonTop: {
    backgroundColor: '#3498db',
    alignSelf: 'center',
    width: '95%',
    paddingVertical: 15,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});