import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Raleway_700Bold } from "@expo-google-fonts/raleway";
import { useFonts } from "expo-font";
import useUser from "@/hooks/auth/useUser";
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Header() {
  const [cartItems, setCartItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  // useEffect(() => {
  //   const subscription = async () => {
  //     const cart: any = await AsyncStorage.getItem("cart");
  //     setCartItems(JSON.parse(cart));
  //   };
  //   subscription();
  // }, []);

  const { user } = useUser();

  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
  });
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <Image
            source={
              user?.avatar?.url ? { uri: user?.avatar?.url } : require("@/assets/icons/User.png")
            }
            style={styles.image}
          />
        </TouchableOpacity>
        <View>
          <Text style={[styles.helloText, { fontFamily: "Raleway_700Bold" }]}>
            Hello,
          </Text>
          <Text style={[styles.text, { fontFamily: "Raleway_700Bold" }]}>
            {user?.name}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bellButton}
        onPress={() => router.push("/(routes)/notification")}
      >
        <View>
        <Ionicons name="notifications" size={28} color="black" />
          <View style={styles.bellContainer}>
            <Text style={{ color: "#fff", fontSize: 14 }}>
              {notifications?.length}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
    width: "90%",
  },

  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  image: {
    width: 45,
    height: 45,
    marginRight: 8,
    borderRadius: 100,
  },

  text: {
    fontSize: 16,
  },

  bellButton: {
    borderWidth: 1,
    borderColor: "#E1E2E5",
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  bellIcon: {
    alignSelf: "center",
  },

  bellContainer: {
    width: 20,
    height: 20,
    backgroundColor: "#2467EC",
    position: "absolute",
    borderRadius: 50,
    right: -5,
    top: -5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  helloText: { color: "#7C7C80", fontSize: 14 },
});
