const route = require('express').Router()
/* const bodyParser = require('body-parser')
route.use(bodyParser.urlencoded({extended: true}))
route.use(bodyParser.json()) */

const auths = require('../controllers/auth.controller.js')

route.post('/register/seller', auths.sellerRegister)
route.post('/register/user', auths.userRegister)
route.post('/login', auths.login)

module.exports = route