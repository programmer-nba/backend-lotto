const route = require('express').Router()
const me = require('../controllers/me.controller.js')

// middleware
const verifyToken = require('../middleware/verifyToken.js')

// Me routes control
route.get('/', verifyToken, me.getMe)
route.get('/admin', verifyToken, me.getMeAdmin)

module.exports = route