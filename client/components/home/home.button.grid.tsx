import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

type IconName = 'account' | 'clipboard-text' | 'book' | 'briefcase-account';

const DashboardGrid = () => {
  const data: { id: number; title: string; icon: IconName; gradient: string[] }[] = [
    { id: 1, title: 'Book Counseling', icon: 'account', gradient: ['#6a11cb', '#2575fc'] },
    { id: 2, title: 'Career Assessment', icon: 'clipboard-text', gradient: ['#ff7eb3', '#ff758c'] },
    { id: 3, title: 'Resource Library', icon: 'book', gradient: ['#f7971e', '#ffd200'] },
    { id: 4, title: 'Opportunities', icon: 'briefcase-account', gradient: ['#00c6ff', '#0072ff'] },
  ];

  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.gridContainer}>
      {data.map((item) => (
        <Animated.View key={item.id} style={[styles.cardWrapper, { transform: [{ scale }] }]}>
          <TouchableOpacity
            onPress={() => {
              if (item.title === 'Book Counseling') {
                router.push('/(tabs)/search');
              }
            }}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.cardShadow}
          >
            <LinearGradient colors={item.gradient} style={styles.card}>
              <MaterialCommunityIcons name={item.icon} size={40} color="#fff" />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
  cardWrapper: {
    width: '48%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardShadow: {
    borderRadius: 14,
  },
  card: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardGrid;
