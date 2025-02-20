# Student Counseling Platform

A full-stack student counseling platform that enables students to connect with counselors via real-time chat. The platform includes AI-powered career suggestions, notifications.

## Features

✅ **User Authentication** – Secure login/signup using JWT authentication.
✅ **Real-time Chat** – Students can chat with counselors using Socket.io.
✅ **AI Career Suggestion** – AI-powered chat to suggest career paths.
✅ **Push Notifications** – Counselors get notified when students initiate a chat.
✅ **Payment System** – Integrated payment gateway for session booking.
✅ **Courses & Layout Management** – Dynamic courses and layout configuration.

## Technologies Used

### **Frontend (React Native - Expo)**
- React Native
- Expo
- React Navigation
- Typescript
- Axios (API Requests)
- Expo Notification (Push Notifications)
- Socket.io-client (Real-time Chat)

### **Backend (Node.js & Express)**
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Socket.io (WebSockets for chat)
- Redis (For caching and performance optimization)
- K6 & Grafana (API Load Testing & Monitoring)

## Installation

### **1️⃣ Backend Setup**
```sh
# Clone the repository
git clone https://github.com/yogesh16singh/careerapp.git
cd server

# Install dependencies
npm install

# Create a .env file and configure environment variables
cp .env.example .env

# Start the backend server
npm run dev
```

### **2️⃣ Frontend Setup**
```sh
cd client

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

## Environment Variables

Create a `.env` file in the backend directory and define the following variables:
```env
PORT=8000
DB_URL=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_SECRET_KEY=your_cloudinary_secret_key
REDIS_URL=your_redis_url
SMTP_HOST = smpt.gmail.com
SMTP_PORT = 465
SMTP_SERVICE = gmail
SMTP_MAIL=your mail Id
SMTP_PASSWORD=your mail password

STRIPE_PUBLISHABLE_KEY =your stripe key
STRIPE_SECRET_KEY = your stripe secret key


```

## API Documentation

### **1️⃣ User Authentication**
- `POST /api/v1/user/register` → Register a new user
- `POST /api/v1/user/login` → Login user & get JWT
- `GET /api/v1/user/profile` → Get user details

### **2️⃣ Chat System**
- `GET /api/v1/chat/counselors/:userId` → Get previous counselors a student has chatted with.
- `GET /api/v1/chat/students/:userId` → Get previous students a counselor has chatted with.
- `POST /api/v1/chat/send` → Send a message.
- `GET /api/v1/chat/messages/:conversationId` → Get all messages in a chat.

### **3️⃣ Notifications**
- `POST /api/v1/notifications/send` → Send push notification.
- `GET /api/v1/notifications` → Get previous notifications.

### **4️⃣ AI Career Suggestion**
- `POST /api/v1/ai/suggest` → Get AI-generated career suggestions.

## Socket.io Events

### **Events Sent from Client**
- `joinRoom` → Join a chat room
- `sendMessage` → Send a message to a counselor

### **Events Received from Server**
- `messageReceived` → Listen for new messages
- `notification` → Receive new notifications

## Testing
We use **K6** for load testing and **Grafana** for performance monitoring.
```sh
npm run test
```

## License
This project is licensed under the MIT License.

---

💡 **Contributors:** Yogesh Singh
🚀 **For queries, contact:** ys1997642@gmail.com

