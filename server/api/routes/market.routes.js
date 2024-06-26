const route = require('express').Router()

// import controllers
const markets = require('../controllers/market.controller.js')

// import middleware
const verifyToken = require('../middleware/verifyToken.js')
const dateCheck = require('../middleware/dateCheck.js')

// Market routes
route.get('/wholesale', dateCheck, markets.getWholesale) // OK
route.get('/all/:length', dateCheck, markets.getAllsome) // OK
route.get('/all', verifyToken, dateCheck, markets.getAll) // OK

route.get('/retail', dateCheck, markets.getRetail) // OK
route.put('/:id', verifyToken, markets.changeMarket) // OK

module.exports = route