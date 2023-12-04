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

        // Handle 'sendMessage' event
        socket.on('sendMessage', (message) => {
            console.log('Received message from client:', message);
            // You can perform any logic here based on the received message
            // For example, you might want to broadcast the message to other clients in a specific room
            io.emit('newMessage', message);
        });
    });
};

module.exports = socketController;