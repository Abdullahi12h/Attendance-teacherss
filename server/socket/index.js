/**
 * Socket.IO real-time handlers for live attendance sessions.
 * Rooms: `session_<sessionId>` — teacher dashboard + students join to get live updates
 */
const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Teacher / student joins a session room
    socket.on('join_session', ({ sessionId }) => {
      const room = `session_${sessionId}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room: ${room}`);
      socket.emit('joined', { room, sessionId });
    });

    // Teacher leaves a session room
    socket.on('leave_session', ({ sessionId }) => {
      const room = `session_${sessionId}`;
      socket.leave(room);
      console.log(`[Socket] ${socket.id} left room: ${room}`);
    });

    // Simulated scan from browser (teacher demo panel)
    socket.on('simulate_scan', (data) => {
      const room = `session_${data.sessionId}`;
      io.to(room).emit('scan', data);
      console.log(`[Socket] Simulated scan in room ${room}:`, data.studentName);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
