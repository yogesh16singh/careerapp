import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const dummyEvents = [
  {
    id: 1,
    title: 'AI & The Future of Work',
    date: 'March 10, 2025',
    time: '5:00 PM IST',
  },
  {
    id: 2,
    title: 'Resume Building Workshop',
    date: 'March 15, 2025',
    time: '3:00 PM IST',
  },
  {
    id: 3,
    title: 'Career Growth in Tech',
    date: 'March 20, 2025',
    time: '7:00 PM IST',
  },
];

const UpcomingEvents = () => {
  const [events, setEvents] = useState(dummyEvents);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Upcoming Webinars & Events</Text>
        <TouchableOpacity onPress={() =>{}}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.time}>{item.time}</Text>
            <TouchableOpacity style={styles.registerButton}>
              <MaterialIcons name="event" size={16} color="white" />
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    // marginBottom: 16,
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
    padding: 16,
    marginRight: 12,
    width: 270,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0e65f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  registerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default UpcomingEvents;
