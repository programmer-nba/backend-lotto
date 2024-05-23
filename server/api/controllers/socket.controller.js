const socketController = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle disconnect event
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });

        // Handle custom events or messages
        socket.on('customEvent', (data) => {
            console.log('Custom event received:', data);
        });

        // Handle joining a room
        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room ${room}`);
        });

        // Handle leaving a room
        socket.on('leaveRoom', (room) => {
            socket.leave(room);
            console.log(`User ${socket.id} left room ${room}`);
        });

        // Handle 'sendMessage' event to a specific room
        socket.on('sendMessage', ({ room, message }) => {
            console.log(`Received message from client in room ${room}:`, message);
            // Broadcast the message to other clients in the same room
            io.to(room).emit('newMessage', message);
        });
    });
};

module.exports = socketController;
