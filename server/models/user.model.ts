require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: "user" | "admin" | "counselor";
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  expertise?: string;
  experience?: number; // years of experience
  availability?: string; // e.g., "Monday-Friday, 9 AM - 5 PM"
  purchasedCounselors?: string[];
  students?: string[];
  pushToken: String,
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value: string) {
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
    purchasedCounselors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // For users
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // For counselors
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "5m",
  });
};
// sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "3d",
  });
};

// Compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);
export default userModel;
