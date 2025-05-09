import { app } from "./app";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import connectDB from "./utils/db";
import { Server } from "socket.io";
import { initializeSocketIO } from "./socketServer";
import { startNotificationConsumer } from "./kafka/consumer";

require("dotenv").config();

const server = http.createServer(app);

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

// startNotificationConsumer();

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
    credentials: true,
  },
});

app.set("io", io);

initializeSocketIO(io);


// create server
server.listen(process.env.PORT, () => {
  console.log(`Server is connected with port ${process.env.PORT}`);
  connectDB();
});
