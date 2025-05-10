import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import HomePresenter from '../../presenters/HomePresenter';
import Publicacion from '../../components/Publicaciones';
import Notificacion from '../../components/Notificaciones';
import HomeStyles from '../../styles/homeStyle';
import { getAuth } from 'firebase/auth';

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
  }, []);

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

  if (loading) return <ActivityIndicator size="large" color="#8a5c9f" />;
  if (error) return <Text style={HomeStyles.errorText}>{error}</Text>;

  return (
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
              onDelete={handleDelete}
              onEdit={handleEdit}
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
  );
};