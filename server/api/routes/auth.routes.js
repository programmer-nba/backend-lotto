const route = require('express').Router()

const auths = require('../controllers/auth.controller.js')

route.post('/register/seller', auths.sellerRegister)
route.post('/register/user', auths.userRegister)
route.post('/login', auths.login)

module.exports = route