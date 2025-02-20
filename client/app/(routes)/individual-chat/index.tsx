import IndividualChat from "@/screens/chat/Individual.chat.screen";
import { useLocalSearchParams } from "expo-router";

export default function index() {
  const item = useLocalSearchParams();
  return (
      <IndividualChat userId={item.userId} receiverId={item.receiverId} currentChat={item.currentChat}/>
  );
}
