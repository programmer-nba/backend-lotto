const route = require('express').Router()

// import controllers
const users = require('../controllers/user.controller.js')

// import middleware
const verifyToken = require('../middleware/verifyToken.js')

// Routes of user role
route.put('/edit', verifyToken, users.editMyProfile)

module.exports = route