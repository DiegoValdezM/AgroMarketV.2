// src/components/NotificationItem.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Moment from 'react-moment';
import 'moment/locale/es'; // Para que 'fromNow' y otros formatos salgan en español

const NotificationItem = ({ notification, onPress }) => {
  if (!notification || !notification.partner) {
    return null; // No renderizar nada si la notificación o el partner son inválidos
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, !notification.isRead && styles.unreadBackground]}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>💬</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.partnerName, !notification.isRead && styles.unreadTextMain]}>
          {notification.partner.displayName || notification.partner.email || 'Nuevo Mensaje'}
        </Text>
        <Text style={styles.messageSnippet} numberOfLines={1}>
          {notification.messageSnippet}
        </Text>
      </View>
      <Text style={[styles.time, !notification.isRead && styles.unreadTimeText]}>
        {/* AQUÍ ESTÁ LA CORRECCIÓN: Añade la prop element={Text} */}
        <Moment element={Text} fromNow>{notification.timestamp}</Moment>
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  unreadBackground: {
    backgroundColor: '#e6faff',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  partnerName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  messageSnippet: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  unreadTextMain: {
    fontWeight: 'bold',
    color: '#005f8e'
  },
  unreadTimeText: {
    color: '#007bff',
    fontWeight: '600',
  }
});

export default NotificationItem;