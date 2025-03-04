"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value) {
                return emailRegexPattern.test(value);
            },
            message: "Please enter your email",
        },
        unique: true,
    },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        enum: ["user", "admin", "counselor"],
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    pushToken: {
        type: String,
        default: null,
    },
    courses: [
        {
            courseId: String,
        },
    ],
    // Counselor-specific fields
    expertise: {
        type: String, // Example: "Career Counseling", "Mental Health"
        default: null,
    },
    experience: {
        type: Number, // Years of experience
        default: 0,
    },
    availability: {
        type: String, // Example: "Monday-Friday, 9 AM - 5 PM"
        default: null,
    },
    purchasedCounselors: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }], // For users
    students: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }], // For counselors
}, { timestamps: true });
// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
// sign access token
userSchema.methods.SignAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
        expiresIn: "5m",
    });
};
// sign refresh token
userSchema.methods.SignRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
        expiresIn: "3d",
    });
};
// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
const userModel = mongoose_1.default.model("User", userSchema);
exports.default = userModel;
