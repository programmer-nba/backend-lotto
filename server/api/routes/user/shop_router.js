const router = require("express").Router()
const Shop = require("../../controllers/user/shop_controller")

router.post("/shops", Shop.createShop)
router.put("/shops/:id", Shop.updateShop)
router.get("/shops", Shop.getShops)
router.get("/:id/shops", Shop.getMyShops)
router.get("/shops/:id", Shop.getShop)
router.delete("/shops/:id", Shop.deleteShop)

module.exports = router
