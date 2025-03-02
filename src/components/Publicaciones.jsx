import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Communications from 'react-native-communications'; // Importa el módulo
import Ionicons from 'react-native-vector-icons/Ionicons';
const { height } = Dimensions.get('window');

const PublicacionesList = () => {
    const [publicaciones, setPublicaciones] = useState([]);

    useEffect(() => {
        const fetchPublicaciones = async () => {
            const querySnapshot = await getDocs(collection(db, 'posts', 'usuarios'));
            const posts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPublicaciones(posts);
        };

        fetchPublicaciones();
    }, []);

    const makeCall = (telefono) => {
        if (telefono) {
            Communications.phonecall(usuario.telefono, true); // Inicia la llamada con el número de teléfono proporcionado
        } else {
            alert('Número de teléfono no disponible');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.publicationCard}>
            
            <Image source={{ uri: item.imageUrl }} style={styles.publicationImage} />
            <View style={styles.publicationContent}>
                <Text style={styles.publicationTitle}>{item.title}</Text>
                <Text style={styles.publicationSubtitle}>{item.location}</Text>
                <Text style={styles.publicationDescription}>{item.description}</Text>
                <Text style={styles.publicationPrice}>Precio: ${item.price}</Text>
            </View>
            <TouchableOpacity
                style={styles.phoneIcon}
                onPress={() => makeCall(item.telefono)} // Usamos item.telefono para obtener el número de teléfono de la publicación
            >
                <Ionicons name="call-outline" size={24} color="#8a5c9f" />
                <Text style={styles.phoneText}>Llamar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <FlatList
            data={publicaciones}
            keyExtractor={item => item.id}
            renderItem={renderItem}
        />
    );
};

const styles = StyleSheet.create({
    publicationCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        elevation: 3,
    },
    publicationImage: {
        width: '100%',
        height: height * 0.25,
        borderRadius: 15,
        marginBottom: 10,
    },
    publicationContent: {
        marginBottom: 10,
    },
    publicationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    publicationDescription: {
        fontSize: 14,
        marginBottom: 10,
    },
    publicationPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8a5c9f',
    },
    phoneIcon: {
        padding: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 50,
        marginBottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: 10,
    },
    phoneText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#8a5c9f',
    },
});

export default PublicacionesList;
