# Online Chat Application

A real-time chat application built with React (frontend) and Node.js/Express (backend) with Socket.IO for real-time messaging.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn package manager
- MongoDB database (local or cloud instance like MongoDB Atlas)
- A `.env` file with required environment variables

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGO_DB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

## Installation

### 1. Install Root Dependencies

From the root directory:

```bash
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Backend Server

#### Development Mode (with auto-reload)

From the root directory:

```bash
npm run server
```

The backend server will run on `http://localhost:5000` (or the port specified in your `.env` file).

#### Production Mode

```bash
npm start
```

### Frontend Application

#### Development Mode

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the next available port).

#### Build for Production

To create a production build:

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

#### Preview Production Build

To preview the production build locally:

```bash
cd frontend
npm run preview
```

## Running Both Frontend and Backend

To run both servers simultaneously, open two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Available Scripts

### Root Scripts

- `npm run server` - Start the backend server with nodemon (development mode)
- `npm start` - Start the backend server with node (production mode)
- `npm run build` - Install all dependencies and build the frontend

### Frontend Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
Online-Chat-Application/
├── backend/
│   ├── controllers/     # Request handlers
│   ├── db/              # Database connection
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── socket/         # Socket.IO configuration
│   ├── utils/          # Utility functions
│   └── server.js       # Main server file
├── frontend/
│   ├── src/            # React source files
│   ├── public/         # Static assets
│   └── package.json
└── package.json        # Root package.json
```

## Technologies Used

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend

- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Routing
- **Socket.IO Client** - Real-time communication
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **DaisyUI** - UI components
- **React Hot Toast** - Notifications

## API Endpoints

The backend provides the following API routes:

- `/api/auth` - Authentication routes (login, signup, logout)
- `/api/messages` - Message routes (send, get messages)
- `/api/users` - User routes (get users, search users)

## Socket.IO Events

- `connection` - User connects
- `sendMessage` - Send a message
- `newMessage` - Receive a new message
- `typing` - Typing indicator
- `stopTyping` - Stop typing indicator
- `getOnlineUsers` - Get list of online users
- `disconnect` - User disconnects
