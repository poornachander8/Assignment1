const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Client must send authenticate event with JWT to join personal room
    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(decoded.id.toString());
        console.log(`[Socket] User ${decoded.id} joined their room`);
        socket.emit('authenticated', { success: true });
      } catch (err) {
        console.log(`[Socket] Auth failed for ${socket.id}`);
        socket.emit('authenticated', { success: false });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Emit an event to a specific user's personal room.
 * @param {string} userId - MongoDB ObjectId as string
 * @param {string} eventName
 * @param {object} payload
 */
const emitToUser = (userId, eventName, payload) => {
  if (!io) {
    console.warn('[Socket] io not initialized yet');
    return;
  }
  io.to(userId.toString()).emit(eventName, payload);
};

module.exports = { init, emitToUser };
