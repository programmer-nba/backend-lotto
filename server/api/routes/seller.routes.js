const route = require('express').Router()

// import controllers
const sellers = require('../controllers/seller.controller.js')
const lottos = require('../controllers/product.controller.js')

// import middleware
const verifyToken = require('../middleware/verifyToken.js')

// Routes of seller role
route.put('/edit', verifyToken, sellers.editMyProfile)
route.get('/mylottos', verifyToken, sellers.getMyLottos)

route.post('/products/addlotto', verifyToken, lottos.addLottos)

module.exports = route