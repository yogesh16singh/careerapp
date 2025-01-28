import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { styles } from "@/styles/home/toptext.style";

const HomeTopTextBox = () => {
  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.linearcontainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Welcome to Your Future</Text>
        <Text style={styles.description}>
          Discover your path, connect with expert counselors, and explore
          endless opportunities.
        </Text>
      </View>
    </LinearGradient>
  );
};

export default HomeTopTextBox;
