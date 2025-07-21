# Collaborative Coding Platform

## Overview

This project is a real-time collaborative coding platform built using the **MERN stack** (MongoDB, Express.js, React, Node.js) integrated with **Socket.io** for seamless real-time communication. It enables multiple users to join a coding room, edit code collaboratively, run it in the browser using Pyodide (for Python) and a sandboxed JavaScript environment, and chat in real-time. The platform leverages AI-powered video coding techniques to enhance development efficiency and innovation.

## Features

- **Real-Time Collaboration**: Multiple users can edit code simultaneously in a shared room.
- **Multi-Language Support**: Supports JavaScript, Python, Java, and C++ (with browser-compatible execution for JS and Python).
- **Code Execution**: Run Python code using Pyodide and JavaScript in a sandboxed environment with output display.
- **Chat Functionality**: Real-time messaging between users in the same room.
- **User Management**: Display of available users in the room, excluding the current user.
- **Room Management**: Create, join, and delete rooms with immediate UI updates.
- **Typing Indicators**: Shows when other users are typing.

## Tech Stack

- **Frontend**: React, Monaco Editor, Tailwind CSS
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB
- **Real-Time**: Socket.io
- **Python Execution**: Pyodide
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

### Frontend

frontend/├── public/│ ├── index.html│ └── ...├── src/│ ├── components/│ │ ├── CodeEditor.jsx│ │ └── ...│ ├── hooks/│ │ ├── useSocket.js│ │ └── ...│ ├── App.jsx│ ├── index.js│ └── ...├── package.json└── README.md

### Backend

backend/├── config/│ ├── db.js│ └── ...├── controllers/│ ├── roomController.js│ └── ...├── models/│ ├── Room.js│ └── ...├── routes/│ ├── roomRoutes.js│ └── ...├── server.js├── package.json└── README.md

## Installation

### Prerequisites

- Node.js (v14.x or higher)
- MongoDB (local or remote instance)
- npm or yarn

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

Install dependencies:npm install

Create a .env file in the frontend directory and add the following:VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

Start the development server:npm run dev

Access the app at http://localhost:5173 (or the port specified by Vite).

Backend Setup

Navigate to the backend directory:cd backend

Install dependencies:npm install

Create a .env file in the backend directory and add the following:PORT=5000
MONGODB_URI=mongodb://localhost:27017/collaborative-coding
JWT_SECRET=your-secret-key

Start the server:npm start

The server will run on http://localhost:5000.

Usage

Create a Room: Log in and create a new room from the dashboard.
Join a Room: Share the room ID with another user to join collaboratively.
Edit Code: Use the Monaco Editor to write and edit code in real-time.
Run Code: Click "Run Code" to execute JavaScript or Python and view the output.
Chat: Use the chat panel to communicate with other users in the room.
Leave Room: Click "Leave Room" to exit, and the room will be removed immediately.

API Endpoints

POST /api/rooms: Create a new room (authenticated).
PUT /api/rooms/:roomId/code: Update room code and language (authenticated).
DELETE /api/rooms/:roomId: Delete a room (authenticated).

Environment Variables
Frontend

VITE_API_URL: Base URL for API requests.
VITE_SOCKET_URL: WebSocket URL for real-time communication.

Backend

PORT: Server port (default: 5000).
MONGODB_URI: MongoDB connection string.
JWT_SECRET: Secret key for JWT authentication.

Development

Frontend: Use npm run dev for hot reloading.
Backend: Use npm start or nodemon for development with auto-restart.
Video Coding: Leverage AI tools (e.g., video analysis or AI-assisted coding) to enhance productivity.

Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/awesome-feature).
Commit changes (git commit -m 'Add awesome feature').
Push to the branch (git push origin feature/awesome-feature).
Open a Pull Request.

License
This project is licensed under the MIT License. See the LICENSE file for details.
Acknowledgments

Alhumduiallah for the opportunity and guidance.
Thanks to the open-source community for tools like React, Socket.io, and Pyodide.
Special thanks to AI-powered video coding techniques that accelerated development.

Contact
For issues or suggestions, please open an issue on GitHub or contact the maintainer at [gmkandhro182@gmail.com].```
