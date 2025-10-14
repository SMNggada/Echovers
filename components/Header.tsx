import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, Bell } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Echovers' }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Search size={22} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
});

export default Header;