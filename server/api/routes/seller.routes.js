const route = require('express').Router()
// middleware
const {upload, uploadPictures} = require('../middleware/drive.js')

// import controllers
const sellers = require('../controllers/seller.controller.js')
const lottos = require('../controllers/product.controller.js')

// import middleware
const verifyToken = require('../middleware/verifyToken.js')
const dateCheck = require('../middleware/dateCheck.js')

// Routes of seller role
route.put('/edit', verifyToken, upload.any(), uploadPictures, sellers.editMyProfile)
route.get('/report', verifyToken, dateCheck, sellers.shopData)
route.get('/detail/:id', verifyToken, dateCheck, sellers.shopDetail)

route.get('/products/getone', verifyToken, lottos.getCurrentLotto)
route.put('/products/edit', verifyToken, lottos.editCurrentLotto)

route.get('/products/mylottos', verifyToken, lottos.getMyLottos)
route.post('/products/addlotto', verifyToken, dateCheck, lottos.addLottos)

route.delete('/products/delete/:id', verifyToken, lottos.deleteMyLotto)
route.delete('/products/deleteall', verifyToken, lottos.deleteMyLottos)

route.get('/target-shop/:id', verifyToken, lottos.getTargetShop)

route.post('/products/cut-stocks', verifyToken, lottos.cutStocks)
route.post('/products/cut-stocks-front', verifyToken, lottos.cutStocksFront)
route.get('/products/cut-stocks', verifyToken, lottos.getCuttedStokLottos)

route.post('/products/discount/:id', lottos.addDiscount)
route.put('/products/discount/:id', lottos.editDiscount)
route.delete('/products/discount/:id', lottos.deleteDiscount)
route.get('/products/discounts', lottos.getDiscounts)
route.get('/products/discount/:id', lottos.getDiscount)



module.exports = route