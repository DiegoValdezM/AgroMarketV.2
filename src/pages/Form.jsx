import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { storage } from '../../firebaseConfig'; // Asumiendo que tienes la configuración de Firebase en este archivo
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddPostForm = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [user, setUser] = useState(null); // Estado para el usuario
  const auth = getAuth();

  useEffect(() => {
    // Verifica si el usuario está autenticado
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe; // Limpia la suscripción al desmontar el componente
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la galería para seleccionar una imagen.');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setPhoto(result.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen: ' + error.message);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para publicar.');
      return;
    }

    if (title && price && location && description) {
      try {
        let imageUrl = ''; // Inicializa imageUrl vacío

        if (photo) { // Solo sube la imagen si se ha seleccionado
          // Referencia a la ubicación en Firebase Storage
          const imageRef = ref(storage, 'images/' + new Date().getTime());

          // Obtiene la imagen como Blob
          const response = await fetch(photo);
          const blob = await response.blob();

          // Sube el archivo a Firebase Storage
          await uploadBytes(imageRef, blob);

          // Obtiene la URL de la imagen subida
          imageUrl = await getDownloadURL(imageRef);
        }

        // Agregar la publicación a Firestore
        await addDoc(collection(db, 'posts'), {
          title,
          price,
          location,
          description,
          userId: user.uid,
          imageUrl: imageUrl || '', // Si no hay imagen, se guarda vacío
        });

        Alert.alert('Éxito', 'Publicación agregada correctamente.');
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', 'No se pudo agregar la publicación: ' + error.message);
      }
    } else {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Publicación</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Ubicación"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
        <Text style={styles.imagePickerText}>Seleccionar Foto</Text>
      </TouchableOpacity>
      {photo && <Image source={{ uri: photo }} style={styles.imagePreview} />}
      <Button title="Publicar" onPress={handleSubmit} />
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
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  imagePickerButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 15,
  },
});

export default AddPostForm;
