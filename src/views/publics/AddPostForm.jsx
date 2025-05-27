// src/views/publics/AddPostForm.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Asegúrate que esta importación esté
import PostPresenter from '../../presenters/PostPresenter'; // Ajusta la ruta
// import { getAuth } from 'firebase/auth'; // No se usa aquí directamente

const AddPostForm = ({ navigation }) => {
  const [form, setForm] = useState({
    title: '',
    price: '',
    location: '',
    description: '',
    contacto: '',
    imageUri: null
  });

  const [presenter] = useState(new PostPresenter({
    showError: (message) => Alert.alert('Error', message),
    onSuccess: () => {
      Alert.alert('Éxito', 'Publicación creada correctamente');
      navigation.goBack();
    }
  }));

  // Solicitar permisos al cargar la pantalla
  useEffect(() => {
    (async () => {
      console.log("[AddPostForm] Solicitando permisos de galería...");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a tu galería para seleccionar imágenes. Por favor, habilítalo en la configuración de la app.');
        console.log("[AddPostForm] Permiso de galería NO concedido.");
      } else {
        console.log("[AddPostForm] Permiso de galería concedido.");
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      console.log("[AddPostForm] Botón 'Seleccionar Imagen' presionado. Iniciando pickImage...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // <--- CORRECTED LINE
        allowsEditing: true,
        // aspect: [4, 3], // Opcional
        quality: 0.7,
      });

      console.log("[AddPostForm] Resultado de ImagePicker:", JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        console.log("[AddPostForm] Imagen seleccionada. URI:", selectedUri);
        setForm({ ...form, imageUri: selectedUri });
      } else if (result.canceled) {
        console.log("[AddPostForm] Selección de imagen cancelada por el usuario.");
      } else {
        console.log("[AddPostForm] No se seleccionó imagen o result.assets está vacío.");
      }
    } catch (error) {
      console.error("[AddPostForm] Error en pickImage:", error);
      Alert.alert('Error', 'No se pudo abrir la galería de imágenes. Revisa la consola.');
    }
  };

  const handleChange = (field, value) => {
    if (field === 'contacto') {
      value = value.replace(/[^0-9]/g, '');
    }
    setForm({ ...form, [field]: value });
  };

  const handlePublish = () => {
    console.log("[AddPostForm] Preparando para publicar. Estado actual del formulario (form):", JSON.stringify(form, null, 2));
    if (!form.title || !form.description) {
        Alert.alert("Campos incompletos", "Por favor, completa el título y la descripción.");
        return;
    }
    presenter.submitPost(form); // 'form' ya incluye imageUri
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Nueva Publicación</Text>
        
        <TextInput style={styles.input} placeholder="Título" value={form.title} onChangeText={(text) => handleChange('title', text)} />
        <TextInput style={styles.input} placeholder="Precio" value={form.price} onChangeText={(text) => handleChange('price', text)} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Ubicación" value={form.location} onChangeText={(text) => handleChange('location', text)} />
        <TextInput style={[styles.input, { height: 100 }]} placeholder="Descripción" value={form.description} onChangeText={(text) => handleChange('description', text)} multiline />
        <TextInput style={styles.input} placeholder="Número de contacto" value={form.contacto} onChangeText={(text) => handleChange('contacto', text)} keyboardType="phone-pad" maxLength={15}/>

        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.buttonText}>Seleccionar Imagen</Text>
        </TouchableOpacity>
        
        {form.imageUri && (
          <Image source={{ uri: form.imageUri }} style={styles.imagePreview} />
        )}
        
        <View style={styles.publishButtonContainer}>
            <Button
                title="Publicar"
                onPress={handlePublish}
                color="#8a5c9f"
            />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  container: { padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  imageButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  imagePreview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 15, resizeMode: 'cover' },
  publishButtonContainer: { marginTop: 10, marginBottom: 20 }
});

export default AddPostForm;