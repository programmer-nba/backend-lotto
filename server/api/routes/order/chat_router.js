const route = require('express').Router()
const Chat = require('../../controllers/chat.controller.js')

route.post('/chats', Chat.createChat)
route.get('/chats/:user_id', Chat.getUserChats)
route.put('/chats/:id', Chat.endChat)

module.exports = route