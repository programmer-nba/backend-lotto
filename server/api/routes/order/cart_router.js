const router = require("express").Router()
const Cart = require("../../controllers/order/cart_controller")

router.post("/carts", Cart.addToCart)
router.get("/:user_id/carts", Cart.getUserItemsInCart)
router.delete("/carts/:item_id", Cart.deleteItemInCart)
router.delete("/:user_id/carts", Cart.deleteItemsInCart)

router.post("/rowcarts", Cart.addToCartRow)
router.get("/:user_id/rowcarts", Cart.getUserItemsInCartRow)
router.delete("/rowcarts/:item_id", Cart.deleteItemsInCartRow)
router.delete("/:user_id/rowcarts", Cart.deleteItemsInCartRow)

module.exports = router
