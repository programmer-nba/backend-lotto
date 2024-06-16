const route = require('express').Router()
const LineCallBack = require('../controllers/lineCallback.controller')

// Me routes control
route.get('/line-callback-login', LineCallBack.lineLoginCallBack)
route.get('/line-callback-register', LineCallBack.lineRegisterCallBack)
route.get('/line-callback-update', LineCallBack.lineUpdateProfileCallBack)

module.exports = route