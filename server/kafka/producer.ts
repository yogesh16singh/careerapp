// kafka/producer.ts
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "career-app",
  brokers: ["localhost:9094"], // update for prod
});

const producer = kafka.producer();

export const sendNotificationToKafka = async (message: any) => {
  await producer.connect();
  await producer.send({
    topic: "notifications",
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
};
