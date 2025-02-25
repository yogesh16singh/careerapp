import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

 const dummyArticles = [
    {
      id: 1,
      title: 'Top 10 High-Paying Careers in 2025',
      description: 'Explore the most in-demand careers with the highest salaries.',
      image: 'https://tse4.mm.bing.net/th?id=OIP.fc6ty2qcvu-0MK7vLOqt6wHaGE&pid=Api&P=0&h=180',
    },
    {
      id: 2,
      title: 'How to Ace Your Next Job Interview',
      description: 'Learn key interview tips and tricks from industry experts.',
      image: 'https://tse3.mm.bing.net/th?id=OIP.Zy9dQngMRtgvFOgjtaBK3gHaE8&pid=Api&P=0&h=180',
    },
    {
      id: 3,
      title: 'Best Online Courses for Skill Development',
      description: 'A list of top courses to upgrade your skills and boost your career.',
      image: 'https://tse2.mm.bing.net/th?id=OIP.tMlVCagUzc7WeuuyTJpFiAHaDF&pid=Api&P=0&h=180',
    },
  ];

const LatestArticles = () => {
 
  const [articles, setArticles] = useState(dummyArticles);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Latest Articles & Resources</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={articles}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
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
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 220,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  info: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default LatestArticles;
