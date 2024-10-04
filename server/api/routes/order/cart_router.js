const router = require("express").Router()
const Cart = require("../../controllers/order/cart_controller")
const verifyToken = require("../../middleware/verifyToken")

router.post("/carts",  verifyToken, Cart.addToCart)
router.get("/:user_id/carts", verifyToken, Cart.getUserItemsInCart)
router.delete("/carts/:item_id", verifyToken, Cart.deleteItemInCart)
router.delete("/:user_id/carts", verifyToken, Cart.deleteItemsInCart)

router.post("/rowcarts", verifyToken, Cart.addToCartRow)
router.get("/:user_id/rowcarts", verifyToken, Cart.getUserItemsInCartRow)
router.delete("/rowcarts/:item_id", verifyToken, Cart.deleteItemInCartRow)
router.delete("/:user_id/rowcarts", verifyToken, Cart.deleteItemsInCartRow)

module.exports = router
