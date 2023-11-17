const route = require('express').Router()

// import controllers
const sellers = require('../controllers/seller.controller.js')
const lottos = require('../controllers/product.controller.js')

// import middleware
const verifyToken = require('../middleware/verifyToken.js')

// Routes of seller role
route.put('/edit', verifyToken, sellers.editMyProfile)

route.get('/products/getone', verifyToken, lottos.getCurrentLotto)
route.put('/products/edit', verifyToken, lottos.editCurrentLotto)

route.get('/products/mylottos', verifyToken, lottos.getMyLottos)
route.post('/products/addlotto', verifyToken, lottos.addLottos)

route.delete('/products/delete/:id', verifyToken, lottos.deleteMyLotto)
route.delete('/products/deleteall', verifyToken, lottos.deleteMyLottos)

module.exports = route