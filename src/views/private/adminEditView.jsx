// src/views/admin/EditUserScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta

export default function EditUserScreen({ route, navigation }) {
  const { isAdmin } = useAuth();
  const { user } = route.params; // Obtener el usuario pasado por navegación

  if (!isAdmin) {
      navigation.goBack(); // O mostrar mensaje de error
      return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Usuario</Text>
      <Text>ID: {user.id}</Text>
      <Text>Nombre: {user.nombre}</Text>
      <Text>Email: {user.correo}</Text>
      <Text>Rol Actual: {user.role}</Text>
      {/* Aquí irían los campos para editar el rol, nombre, etc. */}
      <Button title="Guardar Cambios (No implementado)" onPress={() => alert('Guardar cambios - Aún no implementado')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});