const router = require("express").Router()
const OrderWholesale = require("../../controllers/order/order_controller")
const SellingReport = require("../../controllers/report/sellingReport")

router.get("/reports/orders-wholesale", OrderWholesale.getOrderWholesaleReports)
router.get("/reports/income-wholesale/:shop_id", SellingReport.getIncome)

module.exports = router