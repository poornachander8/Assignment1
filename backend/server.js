require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const socketManager = require('./socket/socketManager');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const alertRoutes = require('./routes/alertRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const ivrRoutes = require('./routes/ivrRoutes');

const app = express();
const httpServer = http.createServer(app);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for Exotel form-encoded webhooks

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ivr', ivrRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'VeggieMandi API' }));

// Error handler (must be last)
app.use(errorHandler);

// Initialize Socket.IO
socketManager.init(httpServer);

// Connect DB then start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`VeggieMandi backend running on port ${PORT}`);
  });
});
