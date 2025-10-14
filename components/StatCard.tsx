import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Icons from 'lucide-react-native';
import { LucideIcon } from 'lucide-react-native'; // 👈 Import this

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

const StatCard = ({ title, value, icon, color = '#4CAF50' }: StatCardProps) => {
  // Cast the icon safely as a LucideIcon
  const IconComponent = (Icons[icon as keyof typeof Icons] as LucideIcon) || Icons.BarChart;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <IconComponent color="#FFFFFF" size={20} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default StatCard;
