const route = require('express').Router()
const Line = require('../controllers/lineCallback.controller')

// Me routes control
route.get('/line-login', Line.lineLogin)
route.get('/line-callback', Line.lineCallBack)

module.exports = route