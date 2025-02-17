import { SERVER_URI } from "@/utils/uri";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const response = await axios.get(`${SERVER_URI}/get-notifications`, {
          headers: { "access-token": token },
        });
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);
 
  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={{ flex: 1, padding: 14 }}>
      <FlatList
        data={notifications}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#ccc" }}>
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>{item.title}</Text>
            <Text>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <Image
              source={require("@/assets/notification.png")}
              style={{ width: 300, height: 380 }}
            />
            <Text
              style={{
                fontSize: 24,
                marginTop: 20,
                textAlign: "center",
                color: "#333",
                fontFamily: "Raleway_600SemiBold",
              }}
            >
             You have not received any notifications
            </Text>
          </View>
        )}
      />
    </View>

  );
}
