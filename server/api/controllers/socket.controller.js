const { newNotify } = require("./notify.controller")

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
        socket.on('sendMessage', async ({ room, data }) => {
            console.log(`Received message from client in room ${room}:`, data);
            // Broadcast the message to other clients in the same room
            const noti = {
                to: room, // chat_id
                title: `มีข้อความใหม่จาก ${data.sender_name}`,
                detail: data.value,
                data_type: data.data_type,
                from: data.sender_id, // sender name
                icon: "#",
                notify_type: "message"
            }
            //console.log(data)
            const notifyData = await newNotify(noti)
            if (notifyData) {
                io.to(room).emit('newMessage', data);
            }
        });

        socket.on('joinNotify', (userId) => {
            socket.join(userId);
            console.log(`User ${socket.id} joined Notify ${userId}`);
        });

        socket.on('order', async ({ room, orderMessage }) => {
            console.log(`Received order update in room ${room}:`, orderMessage);
            const data = {
                to: room, // user _id
                title: orderMessage.order_no,
                detail: orderMessage.lotto_id.length,
                from: orderMessage.buyer?.toString(), // sender name
                icon: "#",
                notify_type: "order"
            }
            const notifyData = await newNotify(data)
            if (notifyData) {
                io.to(room).emit('newOrder', notifyData);
            }
        });

        socket.on('doneOrder', async ({ room, orderMessage }) => {
            console.log(`Received order update in room ${room}:`, orderMessage);
            const data = {
                to: room, // user _id
                title: orderMessage.order_no,
                detail: 'มีการอัพเดทสถานะออร์เดอร์',
                from: orderMessage.seller?.toString(), // sender name
                icon: "#",
                notify_type: "doneOrder"
            }
            const notifyData = await newNotify(data)
            if (notifyData) {
                io.to(room).emit('newOrder', notifyData);
            }
        });

    });
};

module.exports = socketController;
