import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = 
  | 'account' 
  | 'clipboard-text' 
  | 'book' 
  | 'briefcase-account';

const DashboardGrid = () => {
  const data: { id: number; title: string; icon: IconName; color: string }[]  = [
    { id: 1, title: 'Book Counseling', icon: 'account', color: '#0e65f0' },
    { id: 2, title: 'Career Assessment', icon: 'clipboard-text', color: '#0e65f0' },
    { id: 3, title: 'Resource Library', icon: 'book', color: '#0e65f0' },
    { id: 4, title: 'Opportunities', icon: 'briefcase-account', color: '#0e65f0' },
  ];


  return (
    <View style={styles.gridContainer}>
      {data.map((item) => (
        <TouchableOpacity key={item.id} style={styles.card}>
          <MaterialCommunityIcons name={item.icon} size={40} color={item.color} />
          <Text style={styles.cardTitle}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  card: {
    width: '45%',
    backgroundColor: '#F5F5FF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardGrid;
