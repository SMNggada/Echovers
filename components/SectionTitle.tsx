import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SectionTitleProps {
  title: string;
  seeAll?: boolean;
  icon?: ReactNode;
  onSeeAllPress?: () => void;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ 
  title, 
  seeAll = true, 
  icon = null,
  onSeeAllPress
}) => {
  return (
    <View style={styles.sectionTitleContainer}>
      <View style={styles.sectionTitleLeft}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {seeAll && (
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#666',
  },
});

export default SectionTitle;