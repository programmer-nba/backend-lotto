const Linemessages = require('../controllers/lineMessage.js')
const route = require('express').Router()
const line = require('@line/bot-sdk')
const {Lineconfig} = require('../configs/lineConfig.js')

route.post('/message', line.middleware(Lineconfig), Linemessages.messager)

module.exports = route
