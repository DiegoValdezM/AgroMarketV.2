// src/views/admin/EditUserScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import EditUserPresenter from '../../presenters/EditUserPresenter'; // Asegúrate que la ruta sea correcta
import { useAuth } from '../../context/AuthContext'; // Para verificar si el que edita es admin

const EditUserScreen = ({ route, navigation }) => {
  const { user: initialUser } = route.params;
  const { isAdmin: isEditorAdmin } = useAuth(); // Verifica si el usuario actual es admin

  const [formData, setFormData] = useState({
    nombre: initialUser.nombre || '',
    apellidos: initialUser.apellidos || '',
    correo: initialUser.correo || '', // Email en Firestore
    role: initialUser.role || 'user',
    telefono: initialUser.telefono || '',
    ubicacion: initialUser.ubicacion || '',
    usuario: initialUser.usuario || '', // Nombre de usuario de la app
    isActive: initialUser.isActive === undefined ? true : initialUser.isActive, // Nuevo campo
  });
  const [loading, setLoading] = useState(false);

  const [presenter] = useState(new EditUserPresenter({
    showError: (message) => {
      setLoading(false);
      Alert.alert('Error', message);
    },
    onSuccess: (message) => {
      setLoading(false);
      Alert.alert('Éxito', message || 'Usuario actualizado correctamente');
      navigation.goBack(); // Volver a la lista de usuarios
    }
  }));

  useEffect(() => {
    if (!isEditorAdmin) {
      Alert.alert("Acceso Denegado", "No tienes permisos para editar usuarios.");
      navigation.goBack();
      return;
    }
    navigation.setOptions({ title: `Editar: ${initialUser.nombre || initialUser.id}` });
  }, [isEditorAdmin, navigation, initialUser]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    console.log("[EditUserScreen] Guardando cambios para usuario ID:", initialUser.id);
    console.log("[EditUserScreen] Datos del formulario:", formData);

    if (!formData.nombre.trim() || !formData.correo.trim()) {
      Alert.alert("Campos Requeridos", "El nombre y el correo no pueden estar vacíos.");
      return;
    }
    // Aquí podrías añadir más validaciones (formato de email, etc.)

    setLoading(true);
    await presenter.handleUpdateUser(initialUser.id, formData);
  };

  if (!isEditorAdmin) { // Fallback por si el useEffect no ha corrido o hay demora
      return <View style={styles.centered}><Text>Acceso denegado.</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Editar Usuario</Text>
        <Text style={styles.userIdText}>ID (UID): {initialUser.id}</Text>

        <Text style={styles.label}>Nombre:</Text>
        <TextInput style={styles.input} value={formData.nombre} onChangeText={(val) => handleChange('nombre', val)} />

        <Text style={styles.label}>Apellidos:</Text>
        <TextInput style={styles.input} value={formData.apellidos} onChangeText={(val) => handleChange('apellidos', val)} />

        <Text style={styles.label}>Correo Electrónico (informativo):</Text>
        <TextInput style={styles.input} value={formData.correo} onChangeText={(val) => handleChange('correo', val)} keyboardType="email-address" autoCapitalize="none" />
        <Text style={styles.infoText}>Nota: Cambiar este correo solo afecta la base de datos (Firestore). No cambia el email de inicio de sesión del usuario en Firebase Authentication.</Text>

        <Text style={styles.label}>Nombre de Usuario (app):</Text>
        <TextInput style={styles.input} value={formData.usuario} onChangeText={(val) => handleChange('usuario', val)} />

        <Text style={styles.label}>Teléfono:</Text>
        <TextInput style={styles.input} value={formData.telefono} onChangeText={(val) => handleChange('telefono', val)} keyboardType="phone-pad" />

        <Text style={styles.label}>Ubicación:</Text>
        <TextInput style={styles.input} value={formData.ubicacion} onChangeText={(val) => handleChange('ubicacion', val)} />

        <Text style={styles.label}>Rol:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={formData.role} style={styles.picker} onValueChange={(itemValue) => handleChange('role', itemValue)}>
            <Picker.Item label="Usuario Regular" value="user" />
            <Picker.Item label="Administrador" value="admin" />
            {/* Añade más roles si los tienes */}
          </Picker>
        </View>
        <Text style={styles.infoText}>Importante: Cambiar el rol aquí actualiza Firestore. Para que los permisos se apliquen de forma robusta y segura a nivel de autenticación (Custom Claims), se recomienda usar Cloud Functions.</Text>

        <Text style={styles.label}>Estado de la Cuenta:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={formData.isActive} style={styles.picker} onValueChange={(itemValue) => handleChange('isActive', itemValue)}>
            <Picker.Item label="Activo" value={true} />
            <Picker.Item label="Inactivo (Suspendido)" value={false} />
          </Picker>
        </View>
        <Text style={styles.infoText}>Si la cuenta está inactiva, el usuario podría no poder iniciar sesión (requiere lógica adicional en tu `AuthContext` o reglas de seguridad).</Text>


        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#8a5c9f" />
          ) : (
            <Button title="Guardar Cambios" onPress={handleSaveChanges} color="#8a5c9f" />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { padding: 20, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  userIdText: { fontSize: 12, color: '#666', marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 16, color: '#333', marginBottom: 5, marginTop: 10, fontWeight: '500' },
  input: { backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd', borderRadius: 5, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 5, },
  infoText: { fontSize: 12, color: '#666', marginBottom: 10, fontStyle: 'italic' },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, backgroundColor: '#f0f0f0', marginBottom: 5, },
  picker: { height: 50, width: '100%' },
  buttonContainer: { marginTop: 30, marginBottom: 20, },
});

export default EditUserScreen;