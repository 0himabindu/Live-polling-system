# Live Polling System

A real-time polling system built with React, Express, and Socket.IO that enables teachers to create polls and students to participate in them.

## Features

### Teacher Features
- Create new polls
- View live polling results
- Configure maximum time for polls (optional)
- Kick students out (optional)
- View past poll results (optional)
- Chat with students (optional)

### Student Features
- Unique student identification per tab
- Submit answers to polls
- View live polling results
- 60-second time limit for answering questions
- Chat with teacher (optional)

## Tech Stack

### Frontend
- React
- Redux (for state management)
- Socket.IO Client
- TailwindCSS (for styling)

### Backend
- Express.js
- Socket.IO
- MongoDB (for storing poll results)

## Project Structure
```
live-polling-system/
├── client/             # React frontend
├── server/             # Express backend
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd live-polling-system
```

2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables
```bash
# In server directory
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend server (from client directory)
npm start
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/polling-system
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License.