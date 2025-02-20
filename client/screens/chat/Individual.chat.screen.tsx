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
import useChatSocket from "@/hooks/socket/useSocket";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CONNECTED_EVENT = "connected";
const DISCONNECT_EVENT = "disconnect";
const JOIN_CHAT_EVENT = "joinChat";
const NEW_CHAT_EVENT = "newChat";
const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
const LEAVE_CHAT_EVENT = "leaveChat";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
const MESSAGE_DELETE_EVENT = "messageDeleted";
// const SOCKET_ERROR_EVENT = "socketError";

const IndividualChat = ({ userId, currentChat: Chat }: any) => {
  const currentChat = JSON.parse(Chat);
  const receiverData = currentChat.participants.find(
    (item: any) => item._id !== userId
  );
  const receiverName = receiverData?.name || "Chat";
  const receiverImage = receiverData?.avatar.url || "https://via.placeholder.com/50";

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerContainer}>
          <Image source={{ uri: receiverImage }} style={styles.profileImage} />
          <Text style={styles.headerText}>{receiverName}</Text>
        </View>
      ),
    });
  }, [navigation, receiverName, receiverImage]);

  const [messages, setMessages] = useState<any>([]);
  // State to store the socket instance
  const { socket } = useChatSocket();
  const [isConnected, setIsConnected] = useState(false); // For tracking socket connection
  const [loadingMessages, setLoadingMessages] = useState(false); // To indicate loading of messages
  const [unreadMessages, setUnreadMessages] = useState([]); // To track unread messages
  const [isTyping, setIsTyping] = useState(false); // To track if someone is currently typing
  const [selfTyping, setSelfTyping] = useState(false); // To track if the current user is typing
  const [message, setMessage] = useState(""); // To store the currently typed message
  const [localSearchQuery, setLocalSearchQuery] = useState(""); // For local search functionality

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]); // To store files attached to messages

  const getMessages = async () => {
    try {
      if (!currentChat?._id) console.log("No chat is selected");
      // Filter out unread messages from the current chat as those will be read
      // setUnreadMessages(
      //   unreadMessages?.filter((msg: any) => msg.chat !== currentChat?._id)
      // );
      const res = await axios.get(`${SERVER_URI}/chat-app/messages/${currentChat?._id}`);
      setMessages(res.data.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendChatMessage = async () => {
    if (!currentChat?._id || !socket) return;

    // Notify server that the user stopped typing
    socket.emit(STOP_TYPING_EVENT, currentChat?._id);

    try {
      const formData = new FormData();
      if (message) {
        formData.append("content", message);
      }
      attachedFiles?.map((file) => {
        formData.append("attachments", file);
      });
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await axios.post(
        `${SERVER_URI}/chat-app/messages/${currentChat?._id}`,
        {
          content: message,
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
      setMessages((prev: any) => [response?.data?.data, ...prev]);
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
  const onChatLeave = (chat: any) => {
    // Update the chats by removing the chat that the user left.
    // setChats((prev) => prev.filter((c) => c._id !== chat._id));
  };

  const onConnect = (e: any) => {
    console.log("onConnect");
    setIsConnected(true);
  };

  const onDisconnect = () => {
    console.log("onDisconnect");
    setIsConnected(false);
  };

  // This useEffect handles the setting up and tearing down of socket event listeners.
  useEffect(() => {
    // If the socket isn't initialized, we don't set up listeners.
    if (!socket) return;
    socket?.emit(JOIN_CHAT_EVENT, currentChat._id);
    socket?.on(CONNECTED_EVENT, onConnect);
    // Set up event listeners for various socket events:
    // Listener for when the socket connects.
    // Listener for when the socket disconnects.
    socket.on(DISCONNECT_EVENT, onDisconnect);
    // Listener for when a user is typing.
    // socket.on(TYPING_EVENT, handleOnSocketTyping);
    // Listener for when a user stops typing.
    // socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    // Listener for when a new message is received.
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    // Listener for the initiation of a new chat.
    // socket.on(NEW_CHAT_EVENT, onNewChat);
    // Listener for when a user leaves a chat.
    socket.on(LEAVE_CHAT_EVENT, onChatLeave);
    // Listener for when a group's name is updated.
    // socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
    //Listener for when a message is deleted
    // socket.on(MESSAGE_DELETE_EVENT, onMessageDelete);
    // When the component using this hook unmounts or if `socket` or `chats` change:
    return () => {
      // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      // socket.off(TYPING_EVENT, handleOnSocketTyping);
      // socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      // socket.off(NEW_CHAT_EVENT, onNewChat);
      socket.off(LEAVE_CHAT_EVENT, onChatLeave);
      // socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
      // socket.off(MESSAGE_DELETE_EVENT, onMessageDelete);
    };

    // Note:
    // The `chats` array is used in the `onMessageReceived` function.
    // We need the latest state value of `chats`. If we don't pass `chats` in the dependency array,
    // the `onMessageReceived` will consider the initial value of the `chats` array, which is empty.
    // This will not cause infinite renders because the functions in the socket are getting mounted and not executed.
    // So, even if some socket callbacks are updating the `chats` state, it's not
    // updating on each `useEffect` call but on each socket call.
  }, [socket, socket?.connected]);
  
  useEffect(() => {
    getMessages();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        inverted
        style={styles.messageList}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }: { item: any }) => (
          <View
            style={[
              styles.messageContainer,
              item?.sender?._id === userId ? styles.sent : styles.received,
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

export default IndividualChat;
