const orders = require('../controllers/order.controller.js')
const verifyToken = require('../middleware/verifyToken.js')
const route = require('express').Router()

// admin
route.delete('/delete-all', verifyToken, orders.deleteAllOrders)
route.get('/get-all', verifyToken, orders.getAllOrders)

// ขายปลีก
route.get('/get-mypurchases', verifyToken, orders.getMyPurchase)
route.post('/create', verifyToken, orders.createOrder)

// ขายส่ง
route.put('/accept-order/:id', verifyToken, orders.acceptOrder)
route.get('/get-myorders', verifyToken, orders.getMyOrders)

module.exports = route