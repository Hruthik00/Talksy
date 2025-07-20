# Talksy - Real-Time Chat Application

Talksy is a feature-rich real-time chat application built with MERN stack and Socket.IO.

## Features

- **Real-time messaging** using Socket.IO
- **User authentication** with JWT
- **Private messaging** between users
- **Group chat** functionality
- **Image sharing** via Cloudinary
- **Emoji support** with emoji-mart
- **Typing indicators**
- **Theme customization** with DaisyUI
- **Responsive UI** built with React and Tailwind CSS

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- Cloudinary for image storage

### Frontend
- React with Vite
- Zustand for state management
- Tailwind CSS with DaisyUI for UI
- Socket.IO client for real-time features
- React Router for navigation

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Hruthik00/Talksy.git
   cd Talksy
   ```

2. Install dependencies
   ```
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Environment Setup
   - Create a `.env` file in the backend directory with:
     ```
     MONGODB_URI=your_mongodb_connection_string
     PORT=3000
     JWT_SECRET=your_jwt_secret
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     ```

4. Run the application
   ```
   # Start backend server
   cd backend
   npm run dev

   # In a new terminal, start frontend
   cd frontend
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Project Structure

```
Talksy/
├── backend/             # Node.js backend
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── lib/         # Utilities and services
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   └── index.js     # Entry point
│   └── package.json
│
└── frontend/            # React frontend
    ├── public/          # Static assets
    ├── src/
    │   ├── assets/      # Images and resources
    │   ├── components/  # React components
    │   ├── constants/   # App constants
    │   ├── context/     # React context
    │   ├── lib/         # Utilities
    │   ├── pages/       # Page components
    │   └── store/       # Zustand stores
    └── package.json
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Socket.IO](https://socket.io/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Cloudinary](https://cloudinary.com/) 