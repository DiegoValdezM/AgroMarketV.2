// src/views/AddPostForm.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PostPresenter from '../../presenters/PostPresenter';
import { getAuth } from 'firebase/auth';

const AddPostForm = ({ navigation }) => {
  const [form, setForm] = useState({
    title: '',
    price: '',
    location: '',
    description: '',
    contacto: '',  // Nuevo campo para el número de contacto
    imageUri: null
  });

  const [presenter] = useState(new PostPresenter({
    showError: (message) => Alert.alert('Error', message),
    onSuccess: () => {
      Alert.alert('Éxito', 'Publicación creada correctamente');
      navigation.goBack();
    }
  }));

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        setForm({ ...form, imageUri: result.uri });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleChange = (field, value) => {
    // Limpieza automática para el campo de teléfono (solo números)
    if (field === 'contacto') {
      value = value.replace(/[^0-9]/g, '');
    }
    setForm({ ...form, [field]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Publicación</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={form.title}
        onChangeText={(text) => handleChange('title', text)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Precio"
        value={form.price}
        onChangeText={(text) => handleChange('price', text)}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Ubicación"
        value={form.location}
        onChangeText={(text) => handleChange('location', text)}
      />
      
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Descripción"
        value={form.description}
        onChangeText={(text) => handleChange('description', text)}
        multiline
      />
      
      {/* Nuevo campo para el número de contacto */}
      <TextInput
        style={styles.input}
        placeholder="Número de contacto (ej: 351345678)"
        value={form.contacto}
        onChangeText={(text) => handleChange('contacto', text)}
        keyboardType="phone-pad"
        maxLength={15}  // Longitud máxima para números internacionales
      />
      
      <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
        <Text style={styles.buttonText}>Seleccionar Imagen</Text>
      </TouchableOpacity>
      
      {form.imageUri && (
        <Image source={{ uri: form.imageUri }} style={styles.imagePreview} />
      )}
      
      <Button
        title="Publicar"
        onPress={() => presenter.submitPost(form)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'cover',
  },
});

export default AddPostForm;