# ChatSphere: AI-Driven Real-Time Messaging

## 📝 Description

ChatSphere is a real-time messaging platform with AI-driven features, enabling seamless communication powered by Socket.io. It incorporates AI-based replies, multimedia sharing, customizable themes, and more, creating a personalized and dynamic chat experience for users.

## 🔮 Features

- 💬 **Real-time Messaging**: Live chat powered by Socket.io, delivering seamless communication.
- 🤖 **AI Chat**: AI-driven replies via @ai prompts using the Gemini API and @imagine image generation via Hugging Face.
- 🎨 **User Customization**: 32 themes with live previews via DaisyUI for a personalized UX.
- 🖼️ **Multimedia Support**: Share text, images (Cloudinary), and emojis, with media preview options.
- 👤 **Profile Management**: Cloud-based profile picture upload and read-only account details.
- 🌐 **Live User Status**: View online users with status indicators, and search/filter users.
- 👀 **Chat Preview**: Preview chat experience for both authenticated and guest users.
- 🔐 **Authentication**: Secure JWT token-based authentication for user validation.

## 🚀 Live Preview

You can view the live preview of the project [here](https://fullstack-chat-app-kkh3.onrender.com).

## 💻 Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-20232A?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![ExpressJS](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JSON%20Web%20Tokens-000000?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-ffffff?style=for-the-badge)
![Zustand](https://img.shields.io/badge/Zustand-4f9deb?style=for-the-badge&logo=zustand&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-2a2a2a?style=for-the-badge&logo=cloudinary&logoColor=white)
![HuggingFace](https://img.shields.io/badge/Hugging%20Face-FF4F00?style=for-the-badge&logo=huggingface&logoColor=white)
![Git](https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)
![Render](https://img.shields.io/badge/Render-11C8D1?style=for-the-badge&logo=render&logoColor=white)

### Method 1: Manual Installation

1. **Fork this repository:** Click the Fork button located in the top-right corner of this page.
2. **Clone the repository:**
   ```bash
   git clone https://github.com/Neeraj007235/fullstack-chat-app.git
   ```
3. **Create .env file:**
   Inside the Backend directories create `.env` and set:

   Backend:

   ```bash
   PORT = 4001
   MONGODB_URI = YourMongoDBURI
   JWT_SECRET = YourSecretKey
   CLOUDINARY_CLOUD_NAME = YourCloudinaryCloudName
   CLOUDINARY_API_KEY = YourCloudinaryAPIKey
   CLOUDINARY_API_SECRET = YourCloudinaryAPISecret
   GOOGLE_AI_KEY = gemini API key
   Test = hugging face API key

   NODE_ENV = development


   ```

4. **Install dependencies:**
   ```bash
   npm install     # Run in both Frontend and Backend directories
   ```
5. **Start the servers:**
   Frontend:
   ```bash
   cd Frontend
   npm run dev
   ```
   Backend:
   ```bash
   cd Backend
   npm run dev
   ```
6. **Access the application:**
   ```bash
   http://localhost:5173/
   ```
   
## 🌟 Support Us

If you find this helpful or valuable, please consider 🌟 starring the repository. It helps us gain visibility and encourages further development. We appreciate your support!

## 📧 Contact Information

For questions or inquiries, please contact [Neeraj Gupta](mailto:guptaneeraj2811@gmail.com).
   
