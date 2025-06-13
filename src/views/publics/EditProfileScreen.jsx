// src/views/publics/EditProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Para seleccionar imágenes
import { Ionicons } from '@expo/vector-icons';
import EditProfilePresenter from '../../presenters/EditProfilePresenter'; // Ajusta la ruta

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState(''); // Nombre de usuario para publicaciones
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState(''); // Solo para mostrar, no editable directamente aquí
  const [profilePhoto, setProfilePhoto] = useState(null); // URI de la foto de perfil actual
  const [newProfileImageUri, setNewProfileImageUri] = useState(null); // Nueva URI si se selecciona una imagen
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [presenter] = useState(new EditProfilePresenter({
    showLoading: () => setLoading(true),
    hideLoading: () => setLoading(false),
    showError: (message) => Alert.alert('Error', message),
    showSuccess: (message) => Alert.alert('Éxito', message),
    displayProfile: (data) => {
      setProfileName(data.nombre);
      setProfilePhone(data.telefono);
      setProfileEmail(data.email);
      setProfilePhoto(data.photoURL); // Puede ser null
      setNewProfileImageUri(null); // Resetear cualquier selección anterior
    },
    navigate: (screen) => navigation.navigate(screen)
  }, navigation));

  // Cargar el perfil del usuario al montar el componente
  useEffect(() => {
    presenter.loadUserProfile();
  }, [presenter]);

  // Función para seleccionar imagen de la galería
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto de perfil.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Para que sea cuadrada la foto de perfil
      quality: 0.7, // Reducir calidad para optimizar subida
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewProfileImageUri(result.assets[0].uri); // Guarda la URI de la nueva imagen seleccionada
    }
  };

  const handleSaveProfile = () => {
    const formData = {
      currentPassword,
      newPassword,
      confirmNewPassword,
      nombre: profileName,
      telefono: profilePhone,
      newProfileImageUri,
    };
    presenter.updateProfile(formData);
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#8a5c9f" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Ajusta este offset
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Editar Perfil</Text>

        {/* Sección de Foto de Perfil */}
        <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
          <Image
            source={newProfileImageUri ? { uri: newProfileImageUri } : (profilePhoto ? { uri: profilePhoto } : require('../../../assets/profile-icon.webp'))} // Asegúrate de tener una imagen por defecto
            style={styles.profileImage}
          />
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Campos de Edición */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de Usuario:</Text>
          <TextInput
            style={styles.input}
            value={profileName}
            onChangeText={setProfileName}
            placeholder="Ej. Juan Pérez"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono:</Text>
          <TextInput
            style={styles.input}
            value={profilePhone}
            onChangeText={setProfilePhone}
            placeholder="Ej. 5512345678"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico:</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={profileEmail}
            editable={false} // El correo no se puede cambiar directamente aquí en Firebase Auth
          />
        </View>

        {/* Sección de Cambio de Contraseña */}
        <View style={styles.passwordSection}>
          <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña Actual:</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Ingrese su contraseña actual"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nueva Contraseña:</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Mínimo 6 caracteres"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Nueva Contraseña:</Text>
            <TextInput
              style={styles.input}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              placeholder="Repita la nueva contraseña"
            />
          </View>
        </View>

        {/* Botón Guardar Cambios */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 50, // Espacio extra al final para el teclado
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    alignSelf: 'flex-start',
  },
  // Sección de Foto de Perfil
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden', // Asegura que la imagen no se salga del círculo
    borderWidth: 3,
    borderColor: '#8a5c9f',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    padding: 5,
  },
  // Grupos de Input
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledInput: {
    backgroundColor: '#eee',
    color: '#777',
  },
  // Sección de Contraseña
  passwordSection: {
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  // Botón Guardar
  saveButton: {
    backgroundColor: '#8a5c9f',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
