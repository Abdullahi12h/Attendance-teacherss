const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// MongoDB connection configured below
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

// Configure Socket.IO
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware to inject Socket.IO into routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Standard Middlewares
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Real-Time Socket Connection Handlers
setupSocket(io);

// Initialize Serial Port Service (Arduino RFID listener)
const SerialPortService = require('./services/serialPortService');
SerialPortService.init(io);

// API Route Registry
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/academics', require('./routes/academics'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/rfid', require('./routes/rfid'));
app.use('/api/qr', require('./routes/qr'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Database Connection and Start Server
const connectDB = require('./config/db');
const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[Server] running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('[Server] Database connection failed:', err);
});
