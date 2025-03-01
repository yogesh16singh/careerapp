import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import Loader from "@/components/loader/loader";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import useUser from "@/hooks/auth/useUser";

export default function ChatScreen() {
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    (async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        const refreshToken = await AsyncStorage.getItem("refresh_token");

        const response = await axios.get(`${SERVER_URI}/chat-app/chats`, {
          headers: {
            "access-token": accessToken,
            "refresh-token": refreshToken,
          },
        });

        setChats(response.data.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoadingChats(false);
      }
    })();
  }, []);

  if (loadingChats) return <Loader />;

  // Static AI Chat Item
  const aiChat = {
    _id: "ai-chat",
    name: "AI Career Assistant",
    lastMessage: { content: "Ask me anything about your career!" },
    avatar: "https://cdn-icons-png.flaticon.com/512/4712/4712037.png", // AI Bot Icon
  };

  // Combine AI Chat with user chats
  const chatList = [aiChat, ...chats];

  return (
    <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={styles.gradientBackground}>
      <View style={styles.container}>
        <Text style={styles.header}>Previous Chats</Text>

        <FlatList
          data={chatList}
          keyExtractor={(chat: any) => chat._id}
          renderItem={({ item: chat }) => {
            const isAIChat = chat._id === "ai-chat";
            let receiver = null;
            if(!isAIChat){
               receiver = chat?.participants.find(
                (participant: any) => participant._id !== user?._id
              );
            }
            const profileImage = isAIChat
              ? chat.avatar
              : receiver?.avatar?.url || "https://up.yimg.com/ib/th?id=OIP.4Q7-yMnrlnqwR4ORH7c06AHaHa&pid=Api&rs=1&c=1&qlt=95&w=121&h=121";

            return (
              <TouchableOpacity
                style={styles.chatCard}
                onPress={() =>
                  isAIChat
                    ? router.push({
                      pathname: `(routes)/ai-chat`,
                      params: {
                        userId: user?._id
                      },
                    }) 
                    : router.push({
                        pathname: `(routes)/individual-chat`,
                        params: {
                          userId: user?._id,
                          receiverId: receiver?._id,
                          currentChat: JSON.stringify(chat),
                        },
                      })
                }
              >
                {/* User Image */}
                <Image source={{ uri: profileImage }} style={styles.avatar} />

                <View style={styles.chatInfo}>
                  <Text style={[styles.chatName, isAIChat && styles.aiChatText]}>
                    {isAIChat ? "AI Career Assistant" : receiver?.name || "Counselor"}
                  </Text>
                  <Text style={styles.chatMessage} numberOfLines={1}>
                    {chat?.lastMessage?.content || "Tap to start chatting..."}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No chats found</Text>}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    paddingTop: 20,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 22,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chatCard: {
    flexDirection: "row", // Align image & text
    alignItems: "center",
    padding: 8,
    // #6CCDEA
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1, // Take remaining space
  },
  chatName: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 2,
  },
  chatMessage: {
    fontSize: 14,
    color: "#666",
  },
  aiChatText: {
    color: "#007BFF",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    color: "#888",
  },
});
