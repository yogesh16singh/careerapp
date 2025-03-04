"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomNumber = exports.getMongoosePaginationOptions = exports.removeUnusedMulterImageFilesOnError = exports.removeLocalFile = exports.getLocalPath = exports.getStaticFilePath = exports.getPaginatedPayload = exports.filterObjectKeys = void 0;
const fs_1 = __importDefault(require("fs"));
const winston_logger_1 = __importDefault(require("../logger/winston.logger"));
/**
 *
 * @param {string[]} fieldsArray
 * @param {any[]} objectArray
 * @returns {any[]}
 * @description utility function to only include fields present in the fieldsArray
 * For example,
 * ```js
 * let fieldsArray = [
 * {
 * id:1,
 * name:"John Doe",
 * email:"john@doe.com"
 * phone: "123456"
 * },
 * {
 * id:2,
 * name:"Mark H",
 * email:"mark@h.com"
 * phone: "563526"
 * }
 * ]
 * let fieldsArray = ["name", "email"]
 *
 * const filteredKeysObject = filterObjectKeys(fieldsArray, fieldsArray)
 * console.log(filteredKeysObject)
 *
//  Above line's output will be:
//  [
//      {
//        name:"John Doe",
//        email:"john@doe.com"
//      },
//      {
//        name:"Mark H",
//        email:"mark@h.com"
//      }
//  ]
 *
 * ```
 */
const filterObjectKeys = (fieldsArray, objectArray) => {
    const filteredArray = structuredClone(objectArray).map((originalObj) => {
        let obj = {};
        structuredClone(fieldsArray)?.forEach((field) => {
            if (field?.trim() in originalObj) {
                obj[field] = originalObj[field];
            }
        });
        if (Object.keys(obj).length > 0)
            return obj;
        return originalObj;
    });
    return filteredArray;
};
exports.filterObjectKeys = filterObjectKeys;
/**
 *
 * @param {any[]} dataArray
 * @param {number} page
 * @param {number} limit
 * @returns {{previousPage: string | null, currentPage: string, nextPage: string | null, data: any[]}}
 */
const getPaginatedPayload = (dataArray, page, limit) => {
    const startPosition = +(page - 1) * limit;
    const totalItems = dataArray.length; // total documents present after applying search query
    const totalPages = Math.ceil(totalItems / limit);
    dataArray = structuredClone(dataArray).slice(startPosition, startPosition + limit);
    const payload = {
        page,
        limit,
        totalPages,
        previousPage: page > 1,
        nextPage: page < totalPages,
        totalItems,
        currentPageItems: dataArray?.length,
        data: dataArray,
    };
    return payload;
};
exports.getPaginatedPayload = getPaginatedPayload;
/**
 *
 * @param {import("express").Request} req
 * @param {string} fileName
 * @description returns the file's static path from where the server is serving the static image
 */
const getStaticFilePath = (req, fileName) => {
    return `${req.protocol}://${req.get("host")}/images/${fileName}`;
};
exports.getStaticFilePath = getStaticFilePath;
/**
 *
 * @param {string} fileName
 * @description returns the file's local path in the file system to assist future removal
 */
const getLocalPath = (fileName) => {
    return `public/images/${fileName}`;
};
exports.getLocalPath = getLocalPath;
/**
 *
 * @param {string} localPath
 * @description Removed the local file from the local file system based on the file path
 */
const removeLocalFile = (localPath) => {
    fs_1.default.unlink(localPath, (err) => {
        if (err)
            winston_logger_1.default.error("Error while removing local files: ", err);
        else {
            winston_logger_1.default.info("Removed local: ", localPath);
        }
    });
};
exports.removeLocalFile = removeLocalFile;
/**
 * @param {import("express").Request} req
 * @description **This utility function is responsible for removing unused image files due to the api fail**.
 *
 * **For example:**
 * * This can occur when product is created.
 * * In product creation process the images are getting uploaded before product gets created.
 * * Once images are uploaded and if there is an error creating a product, the uploaded images are unused.
 * * In such case, this function will remove those unused images.
 */
const removeUnusedMulterImageFilesOnError = (req) => {
    try {
        const multerFile = req.file;
        const multerFiles = req.files;
        if (multerFile) {
            // If there is file uploaded and there is validation error
            // We want to remove that file
            (0, exports.removeLocalFile)(multerFile.path);
        }
        if (multerFiles) {
            /** @type {Express.Multer.File[][]}  */
            const filesValueArray = Object.values(multerFiles);
            // If there are multiple files uploaded for more than one fields
            // We want to remove those files as well
            filesValueArray.map((fileFields) => {
                fileFields.map((fileObject) => {
                    (0, exports.removeLocalFile)(fileObject.path);
                });
            });
        }
    }
    catch (error) {
        // fail silently
        winston_logger_1.default.error("Error while removing image files: ", error);
    }
};
exports.removeUnusedMulterImageFilesOnError = removeUnusedMulterImageFilesOnError;
/**
 *
 * @param {{page: number; limit: number; customLabels: mongoose.CustomLabels;}} options
 * @returns {mongoose.PaginateOptions}
 */
const getMongoosePaginationOptions = ({ page = 1, limit = 10, customLabels, }) => {
    return {
        page: Math.max(page, 1),
        limit: Math.max(limit, 1),
        pagination: true,
        customLabels: {
            pagingCounter: "serialNumberStartFrom",
            ...customLabels,
        },
    };
};
exports.getMongoosePaginationOptions = getMongoosePaginationOptions;
/**
 * @param {number} max Ceil threshold (exclusive)
 */
const getRandomNumber = (max) => {
    return Math.floor(Math.random() * max);
};
exports.getRandomNumber = getRandomNumber;
