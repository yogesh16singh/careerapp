"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const cloudinary_1 = require("cloudinary");
const http_1 = __importDefault(require("http"));
const db_1 = __importDefault(require("./utils/db"));
const socket_io_1 = require("socket.io");
const socketServer_1 = require("./socketServer");
require("dotenv").config();
const server = http_1.default.createServer(app_1.app);
// cloudinary config
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
});
const io = new socket_io_1.Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: '*',
        credentials: true,
    },
});
app_1.app.set("io", io);
(0, socketServer_1.initializeSocketIO)(io);
// create server
server.listen(process.env.PORT, () => {
    console.log(`Server is connected with port ${process.env.PORT}`);
    (0, db_1.default)();
});
