const router = require("express").Router()
const Authorization = require("../../controllers/auth/auth_controller")

router.post("/auth-login", Authorization.loginClient)

module.exports = router
