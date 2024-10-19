const router = require("express").Router()
const Authorization = require("../../controllers/auth/auth_controller")
const verifyToken = require("../../middleware/verifyToken")

router.post("/auth-login", Authorization.loginClient)
router.get("/getMe", verifyToken, Authorization.getMe)

module.exports = router
