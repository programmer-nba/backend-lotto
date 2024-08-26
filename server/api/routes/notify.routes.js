const route = require('express').Router()
const Notify = require('../controllers/notify.controller')
//const verifyToken = require('../middleware/verifyToken')

// Me routes control
route.get('/notifies', Notify.getNotifies)
route.put('/notify', Notify.updateNotify)
route.delete('/notify', Notify.deleteNotify)

module.exports = route