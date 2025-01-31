import { useEffect, useState } from "react";
import { View, TextInput, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import useUser from "@/hooks/auth/useUser";
import { Toast } from "react-native-toast-notifications";
import { router } from "expo-router";


export default function UpdateProfile() {
  const { loading, user, setRefetch } = useUser();
  const [expertise, setExpertise] = useState(user?.expertise || "");
  const [experience, setExperience] = useState(user?.experience || "");
  const [availability, setAvailability] = useState(user?.availability || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setExpertise(user?.expertise || "");
      setExperience(user?.experience || "");
      setAvailability(user?.availability || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!expertise || !experience || !availability) {
      Toast.show( "All fields are required!" ,{
        type: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`${SERVER_URI}/update-user-info`, { expertise, experience, availability });
      Toast.show("Profile updated successfully!", {
        type: "success",
      });
      setRefetch(true); 
      router.push("/(tabs)/profile");
    } catch (error) {
      console.error("Update Error:", error);
      Toast.show("Failed to update profile!", {
        type: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={{ flex: 1, paddingTop: 20 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* <Text style={styles.heading}>Update Profile</Text> */}

        {/* Expertise Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Expertise</Text>
          <View style={styles.inputContainer}>
            <AntDesign style={styles.icon} name="user" size={20} color="#A1A1A1" />
            <TextInput
              style={styles.input}
              placeholder="e.g., Web Development"
              value={expertise}
              onChangeText={setExpertise}
            />
          </View>
        </View>

        {/* Experience Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Experience</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons style={styles.icon} name="work-outline" size={20} color="#A1A1A1" />
            <TextInput
              style={styles.input}
              placeholder="e.g., 5 years"
              keyboardType="numeric"
              value={experience.toString()}  // Ensure it's always a string
              onChangeText={(text) => setExperience(text.replace(/[^0-9]/g, ""))}
            />
          </View>
        </View>

        {/* Availability Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Availability</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons style={styles.icon} name="schedule" size={20} color="#A1A1A1" />
            <TextInput
              style={styles.input}
              placeholder="e.g., Full-time"
              value={availability}
              onChangeText={setAvailability}
            />
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={isLoading}>
          {isLoading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.buttonText}>Update Profile</Text>}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
  },
  button: {
    backgroundColor: "#2467EC",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

