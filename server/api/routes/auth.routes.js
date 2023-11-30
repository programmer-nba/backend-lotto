const route = require('express').Router()

const auths = require('../controllers/auth.controller.js')
const pictures = require('../controllers/picture.controller.js')

// middleware
const {upload, uploadPictures} = require('../middleware/drive.js')

route.post('/register/seller', upload, auths.sellerRegister) // <<< old
/* route.post('/register/seller', auths.sellerRegister) // <<< new test */

route.post('/register/user', auths.userRegister)

route.post('/login', auths.login)

route.post('/upload', upload, uploadPictures, pictures.uploadPicture)

module.exports = route