import { SOCKET_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import socketio,{ Socket } from "socket.io-client";

const useChatSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    // Initialize Socket
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          console.error("No access token found.");
          return;
        }

        const newSocket = socketio(SOCKET_URI, {
          withCredentials: true,
          auth: { token },
        });

        setSocket(newSocket);
        // console.log("Socket initialized ✅");

      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    };

    initializeSocket();

    return () => {
    //   console.log("Disconnecting socket...");
      socket?.disconnect();
    };
  }, []);
  return { socket };
};

export default useChatSocket;