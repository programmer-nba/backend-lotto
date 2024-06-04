const TransferCost = require('../controllers/transferCost.controller')
const verifyToken = require('../middleware/verifyToken')
const router = require('express').Router()

router.post('/transfer-cost', TransferCost.createTransferCost)
router.put('/transfer-cost/:id', TransferCost.updateTransferCost)
router.get('/transfer-costs/:seller_id', TransferCost.getMyTransferCosts)
router.get('/transfer-cost/:id', TransferCost.getMyTransferCost)
router.delete('/transfer-cost/:id', TransferCost.deleteTransferCost)

module.exports = router