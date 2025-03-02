import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Publicacion from '../components/Publicaciones'; // Importa el nuevo componente
import Notificacion from '../components/Notificaciones'; // Importa el nuevo componente

export default function HomeScreen() {
    const navigation = useNavigation();

    const [publicaciones, setPublicaciones] = useState([
        {
            id: 1,
            nombre: 'Jesús Alvarez',
            rol: 'Agricultor',
            imagen: require('../../assets/image.png'),
            titulo: "Berrie's",
            subtitulo: 'Fresa y Arandano',
            descripcion: 'Pequeña carga de 2 toneladas de frescas berries a $17 pesos kilo parejo.',
            distancia: '2km. Distancia',
            telefono: '3511477845',
        },
        {
            id: 2,
            nombre: 'Ana Gómez',
            rol: 'Productora',
            imagen: require('../../assets/image2.png'),
            titulo: 'Cosecha de Manzanas',
            subtitulo: 'Manzanas Rojas',
            descripcion: 'Cosecha de manzanas frescas a $20 pesos kilo.',
            distancia: '3km. Distancia',
            telefono: '3511829205',

        },
        {
            id: 3,
            nombre: 'Fernando',
            rol: 'Productora',
            imagen: require('../../assets/image2.png'),
            titulo: 'Cosecha de Manzanas',
            subtitulo: 'Manzanas Rojas',
            descripcion: 'Cosecha de manzanas frescas a $20 pesos kilo.',
            distancia: '3km. Distancia',
            telefono: '3513046302',

        },
    ]);

    const handleForm = () => {
        navigation.navigate('Form');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Buscar proveedor, fruta, cliente..."
                />
                <View style={styles.icons}>
                    <TouchableOpacity>
                        <Text style={styles.iconText}>🔍</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleForm}>
                        <Text style={styles.iconText}>➕</Text>
                    </TouchableOpacity>
                </View>
            </View>
             {/* Sección de Notificaciones */}
             <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notificaciones</Text>
                <Notificacion nombre="Juan Arredondo" mensaje="Precio de la fruta" />
                <Notificacion nombre="Arredondo" mensaje="Precio de la fruta" />
            </View>


            {/* Sección de publi */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Publicaciones</Text>
                {publicaciones.map((pub) => (
                    <Publicacion key={pub.id} publicacion={pub} />
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
        fontSize: 16,
        elevation: 3, // Sombra
    },
    icons: {
        flexDirection: 'row',
    },
    iconText: {
        fontSize: 24,
        marginLeft: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8a5c9f', // Color moderno
        marginBottom: 10,
    },
});
