const router = require("express").Router()
const OrderWholesale = require("../../controllers/order/order_controller")

router.get("/reports/orders-wholesale", OrderWholesale.getOrderWholesaleReports)

module.exports = router