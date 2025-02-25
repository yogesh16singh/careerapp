import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const dummyTestimonials = [
  {
    id: 1,
    name: 'Aarav Gupta',
    review: 'This platform helped me choose the right career path. Highly recommended!',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sneha Kapoor',
    review: 'The counseling sessions were insightful and helped me gain clarity.',
    image: 'https://randomuser.me/api/portraits/women/29.jpg',
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Rohan Verma',
    review: 'I got excellent guidance for my higher studies abroad. Thank you!',
    image: 'https://randomuser.me/api/portraits/men/35.jpg',
    rating: 4.9,
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(dummyTestimonials);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Student Testimonials</Text>

      </View>
      
      <FlatList
        data={testimonials}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.review} numberOfLines={3}>{item.review}</Text>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={18} color="#FFD700" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    // color: '#E69416',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  card: {
    // backgroundColor: '#F0E2CD',
    // backgroundColor: '#C8E8F2',
    backgroundColor: '#fff',
    // borderColor: '#E69416',
    // borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 270,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  review: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    color: '#444',
  },
});

export default Testimonials;
