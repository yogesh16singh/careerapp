import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AiIndividualChat = ({ userId }: any) => {

  const [messages, setMessages] = useState<any>([]);

  const [loadingMessages, setLoadingMessages] = useState(false); // To indicate loading of messages
  
  const [message, setMessage] = useState(""); // To store the currently typed message

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]); // To store files attached to messages

  const getMessages = async () => {
    try {
      const res = await axios.get(`${SERVER_URI}/ai-chat-history/`);
      console.log("response", res.data.data[0].messages);
      if(res.data.data.length === 0){
    router.push("/(routes)/ai-form");

      }
      setMessages(res.data.data[0].messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendChatMessage = async () => {
    try {
      const formData = new FormData();
      if (message) {
        formData.append("userMessage", message);
      }
      attachedFiles?.map((file) => {
        formData.append("attachments", file);
      });
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await axios.post(
        `${SERVER_URI}/continue-chat`,
        {
          userMessage: message,
          attachments: attachedFiles,
        },
        {
          headers: {
            "access-token": accessToken,
          },
        }
      );
 
      // If message is successfully sent, update UI
      setMessage("");
      setAttachedFiles([]);
    getMessages();

      // setMessages((prev: any) => [response?.data?.data, ...prev]);

      // updateChatLastMessage(currentChat?._id || "", response.data);

      // Emit message to the server via socket
      // socket.emit(SEND_MESSAGE_EVENT, response.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const onMessageReceived = (message: any) => {
    console.log("onMessageReceived", message);
    // Check if the received message belongs to the currently active chat
    if (message?.chat !== currentChat?._id) {
      // If not, update the list of unread messages
      // setUnreadMessages((prev) => [message, ...prev]);
    } else {
      // If it belongs to the current chat, update the messages list for the active chat
      setMessages((prev: any) => [message, ...prev]);
    }

    // Update the last message for the chat to which the received message belongs
    // updateChatLastMessage(message.chat || "", message);
  };
  
   const navigation = useNavigation();
  
    useLayoutEffect(() => {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712037.png" }} style={styles.profileImage} />
            <Text style={styles.headerText}>AI Career Assistant</Text>
          </View>
        ),
      });
    }, [navigation]);

  useEffect(() => {
    getMessages();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.messageList}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }: { item: any }) => (
          <View
            style={[
              styles.messageContainer,
              item?.role === "user" ? styles.sent : styles.received,
            ]}
          >
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendChatMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  headerContainer: { flexDirection: "row", alignItems: "center", right: 22 },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerText: { fontSize: 18, fontWeight: "bold" },
  messageList: { flex: 1, padding: 4,marginTop: 8 },
  messageContainer: { paddingVertical: 10,paddingHorizontal: 24, marginVertical: 6, borderRadius: 10,maxWidth: "80%" },
  sent: { alignSelf: "flex-end", backgroundColor: "#2467EC", borderBottomRightRadius: 0 },
  received: { alignSelf: "flex-start", backgroundColor: "#646262", borderBottomLeftRadius: 0 },
  messageText: { color: "#fff" ,fontSize: 14},
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 25,
    margin: 8,
  },
  input: {
    flex: 1,
    height: 40,
    // borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    marginRight: 10,
    borderColor: "#ccc",
  },
  sendButton: { backgroundColor: "#2467EC", padding: 10, borderRadius: 20 },
});

export default AiIndividualChat;
