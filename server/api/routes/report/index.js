const router = require("express").Router()
const OrderWholesale = require("../../controllers/order/order_controller")
const SellingReport = require("../../controllers/report/sellingReport")
const verifyToken = require("../../middleware/verifyToken")

router.get("/reports/orders-wholesale", verifyToken, OrderWholesale.getOrderWholesaleReports)
router.get("/reports/income-wholesale/:shop_id", verifyToken, SellingReport.getIncome)

module.exports = router