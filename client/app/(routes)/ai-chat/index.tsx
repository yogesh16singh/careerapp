import AiIndividualChat from "@/screens/chat/ai.individual.chat.screen";
import { useLocalSearchParams } from "expo-router";

export default function index() {
  const item = useLocalSearchParams();
  return (
      <AiIndividualChat userId={item.userId} />
  );
}
