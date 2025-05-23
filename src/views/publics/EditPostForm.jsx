// src/views/publics/EditPostForm.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import EditPostPresenter from '../../presenters/EditPostPresenter'; // <--- CAMBIO AQUÍ

const EditPostForm = ({ route, navigation }) => {
  const { post: initialPost } = route.params;

  const [form, setForm] = useState({
    id: initialPost.id,
    title: initialPost.title || '',
    price: initialPost.price ? String(initialPost.price) : '',
    location: initialPost.location || '',
    description: initialPost.description || '',
    contacto: initialPost.contacto || '',
    currentImageUrl: initialPost.imageUrl || null,
    newImageLocalUri: null,
    removeCurrentImage: false,
  });
  const [loading, setLoading] = useState(false);

  const [presenter] = useState(new EditPostPresenter({ // <--- CAMBIO AQUÍ
    showError: (message) => {
      setLoading(false);
      Alert.alert('Error', message);
    },
    onSuccess: (message) => {
      setLoading(false);
      Alert.alert('Éxito', message || 'Publicación actualizada correctamente');
      navigation.goBack();
    }
  }));

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar imágenes.');
      }
    })();
    navigation.setOptions({ title: `Editar: ${initialPost.title || 'Publicación'}` });
  }, [navigation, initialPost.title]);

  const pickImage = async () => {
    try {
      console.log("[EditPostForm] Iniciando selección de nueva imagen...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      console.log("[EditPostForm] Resultado de ImagePicker:", JSON.stringify(result, null, 2));
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        console.log("[EditPostForm] Nueva imagen seleccionada. URI local:", newUri);
        setForm(prevForm => ({
          ...prevForm,
          currentImageUrl: newUri,
          newImageLocalUri: newUri,
          removeCurrentImage: false,
        }));
      } else {
        console.log("[EditPostForm] Selección de nueva imagen cancelada o sin assets.");
      }
    } catch (error) {
      console.error("[EditPostForm] Error en pickImage:", error);
      Alert.alert('Error', 'No se pudo seleccionar la nueva imagen.');
    }
  };

  const handleRemoveImage = () => {
    console.log("[EditPostForm] Solicitando remover imagen actual.");
    setForm(prevForm => ({
        ...prevForm,
        currentImageUrl: null,
        newImageLocalUri: null,
        removeCurrentImage: true,
    }));
  };

  const handleChange = (field, value) => {
    if (field === 'contacto') value = value.replace(/[^0-9]/g, '');
    setForm({ ...form, [field]: value });
  };

  const handleUpdate = async () => {
    console.log("[EditPostForm] Preparando para actualizar. Estado actual del formulario:", JSON.stringify(form, null, 2));
    if (!form.title || !form.description) {
        Alert.alert("Campos incompletos", "Por favor, completa el título y la descripción.");
        return;
    }
    const numericPrice = Number(form.price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio numérico válido y mayor a cero.');
      return;
    }

    setLoading(true);
    await presenter.handleUpdatePost(form.id, {
        title: form.title,
        price: numericPrice,
        location: form.location,
        description: form.description,
        contacto: form.contacto,
        newImageLocalUri: form.newImageLocalUri,
        originalImageUrlFromPost: initialPost.imageUrl, // Pasar la URL original del post
        removeCurrentImage: form.removeCurrentImage
    });
  };

  const displayImageUri = form.newImageLocalUri || form.currentImageUrl;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Editar Publicación</Text>
        
        <TextInput style={styles.input} placeholder="Título" value={form.title} onChangeText={(text) => handleChange('title', text)} />
        <TextInput style={styles.input} placeholder="Precio" value={form.price} onChangeText={(text) => handleChange('price', text)} keyboardType="numeric"/>
        <TextInput style={styles.input} placeholder="Ubicación" value={form.location} onChangeText={(text) => handleChange('location', text)} />
        <TextInput style={[styles.input, { height: 100 }]} placeholder="Descripción" value={form.description} onChangeText={(text) => handleChange('description', text)} multiline />
        <TextInput style={styles.input} placeholder="Número de contacto" value={form.contacto} onChangeText={(text) => handleChange('contacto', text)} keyboardType="phone-pad" maxLength={15}/>
        
        <Text style={styles.imageLabel}>Imagen:</Text>
        {displayImageUri ? (
          <Image source={{ uri: displayImageUri }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.noImageText}>No hay imagen para esta publicación.</Text>
        )}

        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.buttonText}>{initialPost.imageUrl || form.newImageLocalUri ? 'Cambiar Imagen' : 'Seleccionar Imagen'}</Text>
        </TouchableOpacity>

        { (form.currentImageUrl || initialPost.imageUrl) && !form.newImageLocalUri && !form.removeCurrentImage && (
            <TouchableOpacity onPress={handleRemoveImage} style={[styles.imageButton, styles.removeButton]}>
                <Text style={styles.buttonText}>Quitar Imagen Actual</Text>
            </TouchableOpacity>
        )}
        
        <View style={styles.publishButtonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#8a5c9f" />
          ) : (
            <Button title="Guardar Cambios" onPress={handleUpdate} color="#8a5c9f" />
          )}
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
  imageLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 5 },
  imageButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  removeButton: { backgroundColor: '#f44336', marginTop: 0 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  imagePreview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 10, backgroundColor: '#e0e0e0' },
  noImageText: { textAlign: 'center', color: '#666', marginBottom: 10, fontStyle: 'italic' },
  publishButtonContainer: { marginTop: 10, marginBottom: 20 }
});

export default EditPostForm;