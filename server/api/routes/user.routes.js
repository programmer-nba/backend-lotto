const route = require('express').Router()

// import controllers
const users = require('../controllers/user.controller.js')

// import middleware
const verifyToken = require('../middleware/verifyToken.js')
const {upload, uploadPictures} = require('../middleware/drive.js')

// Routes of user role
route.put('/edit', verifyToken, upload, uploadPictures, users.editMyProfile)
route.get('/mylottos', verifyToken, users.getMyLottos)

module.exports = route