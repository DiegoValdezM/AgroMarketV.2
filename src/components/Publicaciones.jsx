import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Communications from 'react-native-communications';
import { getAuth } from 'firebase/auth';

const Publicacion = ({ publicacion, onDelete, onEdit }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const isOwner = currentUser && currentUser.uid === publicacion.userId;

  const handleCall = () => {
    if (publicacion.contacto) {
      Communications.phonecall(publicacion.contacto, true);
    } else {
      Alert.alert('contacto', 'Número no disponible');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar Publicación',
      '¿Estás seguro de eliminar esta publicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => onDelete(publicacion.id) }
      ]
    );
  };

  return (
    <View style={styles.publicationCard}>
      {/* Header con información del usuario */}
      <View style={styles.userHeader}>
        <Image 
          source={publicacion.userPhoto ? { uri: publicacion.userPhoto } : require('../../assets/3.jpg')} 
          style={styles.userImage}
        />
        <Text style={styles.userName}>{publicacion.userName || 'Wey'}</Text>
        
        {isOwner && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => onEdit(publicacion)}>
              <Ionicons name="create-outline" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete}>
              <Ionicons name="trash-outline" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Contenido de la publicación */}
      <Image 
        source={{ uri: publicacion.imageUrl }} 
        style={styles.publicationImage} 
        resizeMode="cover"
      />
      
      <View style={styles.publicationContent}>
        <Text style={styles.publicationTitle}>{publicacion.title}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.publicationLocation}>{publicacion.location}</Text>
        </View>
        <Text style={styles.publicationDescription}>{publicacion.description}</Text>
        <Text style={styles.publicationPrice}>${publicacion.price}</Text>
      </View>

      {/* Botón de contacto */}
      <TouchableOpacity
        style={styles.contactButton}
        onPress={handleCall}
      >
        <Ionicons name="call-outline" size={20} color="#fff" />
        <Text style={styles.contactText}>Contactar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  publicationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  publicationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  publicationContent: {
    marginBottom: 12,
  },
  publicationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#222',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  publicationLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  publicationDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    lineHeight: 20,
  },
  publicationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8a5c9f',
  },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#8a5c9f',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  contactText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Publicacion;