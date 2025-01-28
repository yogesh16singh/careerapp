import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ChatToggleButtons = ({ selected, setSelected }: { 
    selected: "ai" | "regular"; 
    setSelected: (value: "ai" | "regular") => void; 
  }) => {

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, selected === 'ai' && styles.selectedButton]}
        onPress={() => setSelected('ai')}
      >
        <Text style={[styles.buttonText, selected === 'ai' && styles.selectedText]}>Chat with AI</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.regularButton, selected === 'regular' && styles.selectedButton]}
        onPress={() => setSelected('regular')}
      >
        <Text style={[styles.buttonText, selected === 'regular' && styles.selectedText]}>Chat with Counselor</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007BFF',
    marginHorizontal: 5,
  },
  regularButton: {
    backgroundColor: 'white',
  },
  selectedButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
  },
  selectedText: {
    color: 'white',
  },
});

export default ChatToggleButtons;