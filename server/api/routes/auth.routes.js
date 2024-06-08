const route = require('express').Router()

// controllers
const auths = require('../controllers/auth.controller.js')
const pictures = require('../controllers/picture.controller.js')

// middleware
const {upload, uploadPictures} = require('../middleware/drive.js')

route.post('/register/seller', upload.any(), auths.sellerRegister)

route.post('/register/user', auths.userRegister)

route.post('/login', auths.login)

route.post('/login-line', auths.loginLine)

route.post('/upload', upload.any(), uploadPictures, pictures.uploadSellerPicture)

module.exports = route