const route = require('express').Router()

// controllers
const orders = require('../controllers/order.controller.js')

// middlewares
const {upload, uploadPictures} = require('../middleware/drive.js')
const verifyToken = require('../middleware/verifyToken.js')

// admin
route.delete('/delete-all', verifyToken, orders.deleteAllOrders)
route.get('/get-all', verifyToken, orders.getAllOrders)

// ขายปลีก
route.get('/get-mypurchases', verifyToken, orders.getMyPurchase)
route.post('/create', verifyToken, orders.createOrder)
route.put('/payment-order/:id', verifyToken, upload, uploadPictures, orders.payment)
route.put('/done-order/:id', verifyToken, orders.doneOrder)

// ขายส่ง
route.put('/accept-order/:id', verifyToken, orders.acceptOrder)
route.get('/get-myorders', verifyToken, orders.getMyOrders)
route.put('/ready-order/:id', verifyToken, orders.readyOrder)
route.put('/receipt-order/:id', verifyToken, orders.receipt)

// ทุกคน
route.put('/cancle-order/:id', verifyToken, orders.cancleOrder)
route.get('/:id', verifyToken, orders.getOrder)

module.exports = route