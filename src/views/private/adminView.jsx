// src/views/admin/AdminUserListScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { app } from '../../../firebaseConfig'; // Ajusta la ruta a tu firebaseConfig
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta

const db = getFirestore(app);



const UserItem = ({ item, onEdit, onDelete }) => (
  <View style={styles.userItemContainer}>
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{item.nombre || 'Usuario sin nombre'} ({item.usuario || 'N/A'})</Text>
      <Text style={styles.userEmail}>{item.correo}</Text>
      <Text style={styles.userRole}>Rol: {item.role}</Text>
    </View>
    <View style={styles.userActions}>
      <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => onEdit(item)}>
        <Text style={styles.actionButtonText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(item.id, item.nombre)}>
        <Text style={styles.actionButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function AdminView({ navigation }) {
  const { isAdmin, currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      // Si por alguna razón un no-admin llega aquí, redirigir o mostrar error.
      Alert.alert("Acceso Denegado", "No tienes permisos para acceder a esta sección.");
      navigation.goBack();
      return;
    }

    setLoading(true);
    const usersCollectionRef = collection(db, 'usuarios');

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(usersCollectionRef, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        // No listar al administrador actual en la lista para evitar que se autoelimine/edite fácilmente
        if (doc.id !== currentUser?.uid) {
          usersData.push({ id: doc.id, ...doc.data() });
        }
      });
      setUsers(usersData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error obteniendo usuarios:", err);
      setError("No se pudieron cargar los usuarios. Intenta de nuevo.");
      setLoading(false);
    });

    // Limpiar el listener al desmontar el componente
    return () => unsubscribe();

  }, [isAdmin, navigation, currentUser?.uid]);

  const handleEditUser = useCallback((user) => {
    // Navegar a una pantalla de edición de usuario, pasando los datos del usuario
    navigation.navigate('EditUser', { user }); // Necesitarás crear EditUserScreen
    console.log('Editar usuario:', user);
  }, [navigation]);

  const handleDeleteUser = useCallback(async (userId, userName) => {
    Alert.alert(
      "Confirmar Eliminación",
      `¿Estás seguro de que quieres eliminar al usuario ${userName || userId}? Esta acción eliminará sus datos de Firestore.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Eliminar de Firestore
              await deleteDoc(doc(db, 'usuarios', userId));
              Alert.alert("Éxito", `Usuario ${userName || userId} eliminado de Firestore.`);
              // setUsers(prevUsers => prevUsers.filter(user => user.id !== userId)); // Actualización optimista o esperar onSnapshot

              // 2. IMPORTANTE: Eliminar de Firebase Authentication (REQUIERE CLOUD FUNCTION)
              // Aquí es donde llamarías a tu Cloud Function.
              // Por ejemplo: const deleteUserAuth = firebase.functions().httpsCallable('deleteUserAuth');
              // await deleteUserAuth({ uid: userId });
              // Alert.alert("Éxito", `Usuario ${userName || userId} completamente eliminado.`);
              // Considera que si la Cloud Function falla, necesitarás manejar ese caso.
              Alert.alert(
                "Acción Adicional Requerida",
                "El usuario ha sido eliminado de la base de datos. Para completar la eliminación (borrarlo del sistema de autenticación), se requiere una acción del administrador en el backend (Cloud Function) que aún no está implementada en este ejemplo."
              );

            } catch (err) {
              console.error("Error eliminando usuario de Firestore:", err);
              Alert.alert("Error", `No se pudo eliminar al usuario ${userName || userId} de Firestore.`);
            }
          },
        },
      ]
    );
  }, []);


  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" color="#8a5c9f" />;
  }

  if (error) {
    return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
  }

  if (!isAdmin) {
    // Este es un fallback, el useEffect ya debería haber redirigido.
    return <Text style={[styles.centered, styles.errorText]}>Acceso Denegado.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Usuarios</Text>
      {users.length === 0 ? (
        <Text style={styles.emptyListText}>No hay otros usuarios registrados.</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={({ item }) => (
            <UserItem
              item={item}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f4f4f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 30,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  userItemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  userInfo: {
    flex: 1, // Para que ocupe el espacio disponible
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  userRole: {
    fontSize: 13,
    color: '#8a5c9f', // Tu color morado
    fontStyle: 'italic',
  },
  userActions: {
    flexDirection: 'column', // Botones uno encima del otro
    marginLeft: 10,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 70, // Ancho mínimo para los botones
  },
  editButton: {
    backgroundColor: '#3498db', // Azul
    marginBottom: 8, // Espacio entre editar y eliminar
  },
  deleteButton: {
    backgroundColor: '#e74c3c', // Rojo
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});