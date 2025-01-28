import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useFonts, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import {
    heightPercentageToDP as hp,
  } from "react-native-responsive-screen";
const NoChatPlaceholder = ({
  selected,
  onFillForm,
}: {
  selected: "ai" | "regular";
  onFillForm: () => void;
}) => {
    let [fontsLoaded, fontError] = useFonts({
        Raleway_700Bold,
        Nunito_400Regular,
        Nunito_700Bold,
      });
    
      if (!fontsLoaded && !fontError) {
        return null;
      }
  return (
    <View style={styles.container}>
      <Image source={require("@/assets/no-chat.png")} style={styles.image} />
      <Text style={styles.noChatText}>No Chats</Text>
      {selected === "ai" && (
        <TouchableOpacity style={styles.button} onPress={onFillForm}>
          <Text style={styles.buttonText}>
            Click to fill the form to start chat with AI
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 20,
  },
  image: {
    width: 150,
    height: "60%",
    resizeMode: "contain",
    marginBottom: 10,
  },
  noChatText: {
    fontFamily: "Raleway_700Bold",
    fontSize: hp("4%"),
    color: "#333",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007BFF",
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: "white",
    fontSize: hp("2%"),
  },
});

export default NoChatPlaceholder;
