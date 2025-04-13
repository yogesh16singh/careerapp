// kafka/consumer.ts
import { Kafka } from "kafkajs";
import * as Expo from "expo-server-sdk";

const kafka = new Kafka({
  clientId: "career-app",
  brokers: ["localhost:9094"],
});

const consumer = kafka.consumer({ groupId: "notification-group" });
const expo = new Expo.Expo();

export const startNotificationConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "notifications", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (message.value) {
        const payload = JSON.parse(message.value.toString());
        const pushMessage = {
          to: payload.to,
          sound: "default",
          title: payload.title,
          body: payload.body,
        };

        if (!Expo.Expo.isExpoPushToken(payload.to)) {
          console.error("Invalid Expo token:", payload.to);
          return;
        }

        try {
          const receipt = await expo.sendPushNotificationsAsync([pushMessage]);
          console.log("Push sent:", receipt);
        } catch (error) {
          console.error("Push failed:", error);
        }
      }
    },
  });
};
