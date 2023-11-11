const route = require('express').Router()

// import controllers
const markets = require('../controllers/market.controller.js')

// import middleware
const verifyToken = require('../middleware/verifyToken.js')

// Market routes
route.get('/wholesale', verifyToken, markets.getinMarket) // OK
route.post('/wholesale/:id', verifyToken, markets.addtoMarket) // OK
route.delete('/wholesale/:id', verifyToken, markets.removefromMarket) // OK

module.exports = route