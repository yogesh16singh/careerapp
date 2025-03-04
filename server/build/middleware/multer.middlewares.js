"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // This storage needs public/images folder in the root directory
        // Else it will throw an error saying cannot find path public/images
        cb(null, "./public/images");
    },
    // Store file in a .png/.jpeg/.jpg format instead of binary
    filename: function (req, file, cb) {
        let fileExtension = "";
        if (file.originalname.split(".").length > 1) {
            fileExtension = file.originalname.substring(file.originalname.lastIndexOf("."));
        }
        const filenameWithoutExtension = file.originalname
            .toLowerCase()
            .split(" ")
            .join("-")
            ?.split(".")[0];
        cb(null, filenameWithoutExtension +
            Date.now() +
            Math.ceil(Math.random() * 1e5) + // avoid rare name conflict
            fileExtension);
    },
});
// Middleware responsible to read form data and upload the File object to the mentioned path
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1 * 1000 * 1000,
    },
});
