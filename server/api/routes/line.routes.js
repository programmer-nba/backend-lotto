const route = require('express').Router()
const LineCallBack = require('../controllers/lineCallback.controller')

// Me routes control
route.get('/line-callback-login', LineCallBack.lineLoginCallBack)

module.exports = route