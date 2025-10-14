import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';

const mockNotifications = [
  { id: '1', title: 'New Episode Released', subtitle: 'Your subscribed show just dropped a new episode', read: false },
  { id: '2', title: 'Playlist Update', subtitle: '"Chill Vibes" playlist has 3 new tracks', read: true },
  { id: '3', title: 'Creator Update', subtitle: 'Your favorite creator published a new audiobook', read: false },
];

export default function NotificationScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}>
      {item.read ? (
        <CheckCircle size={20} color="#1DB954" />
      ) : (
        <Circle size={20} color="#999" />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  item: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  textContainer: { marginLeft: 12, flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 48 },
});