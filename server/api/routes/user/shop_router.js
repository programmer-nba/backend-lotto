const router = require("express").Router()
const Shop = require("../../controllers/user/shop_controller")
const verifyToken = require("../../middleware/verifyToken")

router.post("/shops", verifyToken, Shop.createShop)
router.put("/shops/:id", verifyToken, Shop.updateShop)
router.get("/shops", verifyToken, Shop.getShops)
router.get("/:id/shops", verifyToken, Shop.getMyShops)
router.get("/shops/:id", verifyToken, Shop.getShop)
router.delete("/shops/:id", verifyToken, Shop.deleteShop)

module.exports = router
