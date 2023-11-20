const orders = require('../controllers/order.controller.js')
const verifyToken = require('../middleware/verifyToken.js')
const route = require('express').Router()

route.post('/create', verifyToken, orders.createOrder)
route.get('/get-all', verifyToken, orders.getAllOrders)
route.get('/get-myorders', verifyToken, orders.getMyOrders)

route.delete('/delete-all', verifyToken, orders.deleteAllOrders)

module.exports = route