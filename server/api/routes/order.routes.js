const route = require('express').Router()

// controllers
const orders = require('../controllers/order.controller.js')
const chats = require('../controllers/chat.controller.js')

// middlewares
const {upload, uploadPictures} = require('../middleware/drive.js')
const verifyToken = require('../middleware/verifyToken.js')
const uploadBuffer = require('../middleware/imgBuffer.js')

// admin
route.delete('/delete-all', verifyToken, orders.deleteAllOrders)
route.get('/get-all', verifyToken, orders.getAllOrders)

// ขายปลีก
route.get('/get-mypurchases', verifyToken, orders.getMyPurchase)
route.post('/create', verifyToken, orders.createOrder)
route.put('/payment-order/:id', verifyToken, upload.any(), uploadPictures, orders.payment)
route.put('/done-order/:id', verifyToken, orders.doneOrder)

// ขายส่ง
route.put('/accept-order/:id', verifyToken, orders.acceptOrder)
route.get('/get-myorders', verifyToken, orders.getMyOrders)
/* route.put('/ready-order/:id', verifyToken, orders.readyOrder) */
route.put('/receipt-order/:id', verifyToken, orders.receipt)
route.put('/discount/:id', verifyToken, orders.addDiscount)

// ทุกคน
route.put('/cancle-order/:id', verifyToken, orders.cancleOrder)
route.get('/:id', verifyToken, orders.getOrder)
route.get('/receipt/:id', verifyToken, orders.orderReceipt)

route.post('/chat/:id', verifyToken, chats.createChat)
route.get('/chat/:id', verifyToken, chats.getMessages)
route.put('/chat/:id', verifyToken, uploadBuffer.single('img'), chats.sendMessage)
route.delete('/chat/:id', verifyToken, chats.deleteMessage)

module.exports = route