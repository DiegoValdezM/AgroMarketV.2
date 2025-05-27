import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet // Importa StyleSheet
} from 'react-native';
import HomePresenter from '../../presenters/HomePresenter';
import Publicacion from '../../components/Publicaciones';
import Notificacion from '../../components/Notificaciones';
import HomeStyles from '../../styles/homeStyle'; // Tus estilos existentes
import { getAuth } from 'firebase/auth';
// Opcional: Si quieres usar iconos vectoriales
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen({ navigation }) {
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([]);
  const [originalPublicaciones, setOriginalPublicaciones] = useState([]);

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
    navigate: (screen) => navigation.navigate(screen)
  }));

  useEffect(() => {
    presenter.loadPublicacionesEnTiempoReal();
    return () => presenter.onDestroy();
  }, [presenter]); // Añade presenter a las dependencias de useEffect

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

  // Nueva función para navegar a la selección de chat
  const handleNavigateToChatSelection = () => {
    navigation.navigate('ChatSelection'); // Asegúrate que este es el nombre de tu ruta
  };

  if (loading) return <ActivityIndicator style={styles.centeredLoader} size="large" color="#8a5c9f" />;
  if (error) return <Text style={[HomeStyles.errorText, styles.centeredError]}>{error}</Text>;

  return (
    // (1) Envuelve todo en una View para posicionar el FAB correctamente
    <View style={styles.screenContainer}>
      <ScrollView contentContainerStyle={HomeStyles.container}>
        {/* Header con buscador */}
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

        {/* Sección de notificaciones (opcional) */}
        <View style={HomeStyles.section}>
          <Text style={HomeStyles.sectionTitle}>Notificaciones</Text>
          <Notificacion nombre="Juan Arredondo" mensaje="Precio de la fruta actualizado" />
          {/* Aquí podrías mapear notificaciones reales si las tienes */}
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
                onDelete={() => handleDelete(pub.id)} // Pasa una función para evitar ejecución inmediata
                onEdit={() => handleEdit(pub)}       // Pasa una función
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

      {/* (2) Botón Flotante para Chat */}
      <TouchableOpacity
        style={styles.chatFab}
        onPress={handleNavigateToChatSelection}
        activeOpacity={0.7} // Buen feedback visual
      >
        {/* <Icon name="chat" size={24} color="#fff" /> Reemplaza Text con Icon si usas react-native-vector-icons */}
        <Text style={styles.chatFabIcon}>💬</Text>
      </TouchableOpacity>
    </View>
  );
};

// (3) Define nuevos estilos o añádelos a tu archivo HomeStyles.js e impórtalos
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    // backgroundColor: HomeStyles.container?.backgroundColor || '#f4f4f8', // Opcional: si quieres que el fondo fuera del scroll coincida
  },
  centeredLoader: { // Estilo para centrar el ActivityIndicator si es la única vista
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredError: { // Estilo para centrar el texto de error
    textAlign: 'center',
    marginTop: 50, // Un poco de espacio
  },
  chatFab: {
    position: 'absolute', // Posicionamiento flotante
    width: 60,
    height: 60,
    borderRadius: 30, // Para hacerlo circular
    backgroundColor: '#8a5c9f', // Tu color principal o uno que destaque
    justifyContent: 'center',
    alignItems: 'center',
    right: 20, // Distancia desde la derecha
    bottom: 20, // Distancia desde abajo
    elevation: 8, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chatFabIcon: {
    fontSize: 24, // Tamaño del emoji/icono
    color: '#fff', // Color del emoji/icono
  },
  // Puedes añadir más estilos o importar de HomeStyles si es necesario
});