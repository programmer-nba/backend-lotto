const orders = require('../controllers/order.controller.js')
const verifyToken = require('../middleware/verifyToken.js')
const route = require('express').Router()

route.post('/create', verifyToken, orders.createOrder)

module.exports = route