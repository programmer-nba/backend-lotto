const route = require('express').Router()

const auths = require('../controllers/auth.controller.js')

// middleware
const {upload, uploadPictures} = require('../middleware/upload.js')

route.post('/register/seller', upload, uploadPictures ,auths.sellerRegister)

route.post('/register/user', auths.userRegister)
route.post('/login', auths.login)

module.exports = route