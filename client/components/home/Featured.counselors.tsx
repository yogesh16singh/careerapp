import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { SERVER_URI } from '@/utils/uri';
import { useRouter } from 'expo-router';

const dummycounselors = [
  {
    _id: 1,
    name: 'Dr. Sophia Patel',
    expertise: 'Career Coach',
    rating: 4.8,
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    _id: 2,
    name: 'Dr. Rohan Mehta',
    expertise: 'Psychologist',
    rating: 4.7,
    image: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
  {
    _id: 3,
    name: 'Dr. Aisha Sharma',
    expertise: 'Education Specialist',
    rating: 4.9,
    image: 'https://randomuser.me/api/portraits/women/47.jpg',
  },
];

const FeaturedCounselors = () => {
  const [counselors, setCounselors] = useState(dummycounselors);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${SERVER_URI}/get-counselors`)
      .then((res) => {
        console.log('Fetched counselors:', res.data.counselors);
        setCounselors((prevCounselors) => [...res.data.counselors, ...prevCounselors]);
      })
      .catch((error) => {
        console.error('Error fetching counselors:', error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Featured Counselors</Text>
      <FlatList
        data={[...counselors, { _id: 'view-all' }]} // Adding "View All" button at the end
        horizontal
        keyExtractor={(item) => item?._id?.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }: { item: any }) =>
          item._id === 'view-all' ? (
            <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.card}>
              <Image source={{ uri: item?.avatar?.url || item.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.expertise}>{item.expertise}</Text>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={18} color="#FFD700" />
                  <Text style={styles.rating}>{item?.rating || 4.5}</Text>
                </View>
              </View>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#C8E8F2',
    borderRadius: 12,
    borderColor: '#36ACD5',
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  expertise: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
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
  viewAllButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#36ACD5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FeaturedCounselors;
