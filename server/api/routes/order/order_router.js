const router = require("express").Router()
const OrderWholesale = require("../../controllers/order/order_controller")
const verifyToken = require("../../middleware/verifyToken")

router.post("/orders-wholesale/checkout", verifyToken, OrderWholesale.checkoutOrderWholesale)
router.post("/orders-wholesale", verifyToken, OrderWholesale.createOrderWholesale)
router.put("/orders-wholesale/update", verifyToken, OrderWholesale.updateOrderWholesale)
router.put("/orders-wholesale/status", verifyToken, OrderWholesale.updateStatusOrderWholesale)
router.get("/orders-wholesale", verifyToken, OrderWholesale.getOrdersWholesale)
router.get("/orders-wholesale/:id", verifyToken, OrderWholesale.getOrderWholesale)
router.get("/orders-wholesale/:order_id/logs", verifyToken, OrderWholesale.getOrderWholesaleLogs)
router.delete("/orders-wholesale/:id", verifyToken, OrderWholesale.deleteOrderWholesale)

router.get('/orders-wholesale/:order_id/slips', verifyToken, OrderWholesale.getOrderSlips);

module.exports = router
