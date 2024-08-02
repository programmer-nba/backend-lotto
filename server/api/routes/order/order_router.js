const router = require("express").Router()
const OrderWholesale = require("../../controllers/order/order_controller")

router.post("/orders-wholesale/checkout", OrderWholesale.checkoutOrderWholesale)
router.post("/orders-wholesale", OrderWholesale.createOrderWholesale)
router.put("/orders-wholesale/update", OrderWholesale.updateOrderWholesale)
router.put("/orders-wholesale/status", OrderWholesale.updateStatusOrderWholesale)
router.get("/orders-wholesale", OrderWholesale.getOrdersWholesale)
router.get("/orders-wholesale/:id", OrderWholesale.getOrderWholesale)
router.delete("/orders-wholesale/:id", OrderWholesale.deleteOrderWholesale)

module.exports = router
