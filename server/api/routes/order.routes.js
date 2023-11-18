const route = require('express').Router()

// middleware
const verifyToken = require('../middleware/verifyToken.js')

// controller
const orders = require('../controllers/order.controller.js')

// routes
route.post('/pre-order', verifyToken, orders.createPreOrder) // create new pre-order
route.get('/pre-order', verifyToken, orders.getAllPreOrders) // get all current pre-order

module.exports = route