// Notificaciones.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Notificacion = ({ nombre, mensaje }) => {
    return (
        <View style={styles.notificationCard}>
            <View style={styles.profileCircle}>
                <Text style={styles.profileInitial}>{nombre.charAt(0)}</Text>
            </View>
            <View style={styles.notificationContent}>
                <Text style={styles.notificationName}>{nombre}</Text>
                <Text style={styles.notificationMessage}>{mensaje}</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addIcon}>Ver</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        elevation: 2, // Sombra
    },
    profileCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#8a5c9f',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    profileInitial: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    notificationContent: {
        flex: 1,
    },
    notificationName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
    },
    addButton: {
        padding: 5,
        backgroundColor: '#ddd',
        borderRadius: 5,
    },
    addIcon: {
        fontSize: 18,
    },
});

export default Notificacion;
