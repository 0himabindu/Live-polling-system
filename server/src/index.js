require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let currentPoll = null;
let pollAnswers = {};
let students = {};
let pollTimer = null;
let pastPolls = [];

// Helper: End poll and broadcast results
function endPoll(io) {
  if (!currentPoll) return;
  // Tally answers
  const results = currentPoll.options.map((opt, idx) => ({
    ...opt,
    votes: Object.values(pollAnswers).filter(ans => ans === idx).length
  }));
  const pollResult = {
    question: currentPoll.question,
    options: results,
    timeLimit: currentPoll.timeLimit,
    totalStudents: Object.keys(students).length,
    answers: { ...pollAnswers },
    endedAt: new Date(),
  };
  pastPolls.push(pollResult);
  io.emit('poll:results', pollResult);
  currentPoll = null;
  pollAnswers = {};
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle teacher joining
  socket.on('teacher:join', () => {
    socket.join('teacher-room');
    // Send current poll and students
    if (currentPoll) {
      socket.emit('poll:new', currentPoll);
    }
    socket.emit('students:list', Object.values(students));
    socket.emit('poll:history', pastPolls);
  });

  // Handle student joining
  socket.on('student:join', ({ name }) => {
    socket.studentName = name;
    students[socket.id] = { id: socket.id, name };
    socket.join('student-room');
    io.to('teacher-room').emit('student:joined', { id: socket.id, name });
    console.log(`[BACKEND] Student joined: ${name} (${socket.id})`);
    // Send current poll if active
    if (currentPoll) {
      console.log(`[BACKEND] Sending currentPoll to student ${name}:`, currentPoll);
      socket.emit('poll:new', currentPoll);
    } else {
      console.log(`[BACKEND] No active poll to send to student ${name}`);
    }
  });

  // Handle new poll creation
  socket.on('poll:create', (pollData) => {
    if (currentPoll) return; // Only one active poll
    currentPoll = pollData;
    pollAnswers = {};
    io.to('student-room').emit('poll:new', pollData);
    io.to('teacher-room').emit('poll:new', pollData);
    // Start timer
    pollTimer = setTimeout(() => {
      endPoll(io);
    }, (pollData.timeLimit || 60) * 1000);
  });

  // Handle student answer submission
  socket.on('poll:answer', ({ optionIndex }) => {
    if (!currentPoll || pollAnswers[socket.id] !== undefined) return;
    pollAnswers[socket.id] = optionIndex;
    io.to('teacher-room').emit('poll:answer', {
      studentId: socket.id,
      studentName: socket.studentName,
      answer: optionIndex
    });
    // If all students have answered, end poll
    if (Object.keys(pollAnswers).length === Object.keys(students).length) {
      endPoll(io);
    }
  });

  // Teacher ends poll manually
  socket.on('poll:end', () => {
    endPoll(io);
  });

  // Teacher requests poll history
  socket.on('poll:history', () => {
    socket.emit('poll:history', pastPolls);
  });

  // Teacher kicks a student
  socket.on('student:kick', (studentId) => {
    if (students[studentId]) {
      io.to(studentId).emit('kicked');
      delete students[studentId];
      io.to('teacher-room').emit('student:left', { id: studentId });
    }
  });

  // Handle chat messages
  socket.on('chat:message', (message) => {
    const messageData = {
      sender: socket.studentName || 'Teacher',
      text: message,
      timestamp: new Date()
    };
    io.emit('chat:message', messageData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.studentName) {
      delete students[socket.id];
      io.to('teacher-room').emit('student:left', { id: socket.id, name: socket.studentName });
    }
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polling-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 