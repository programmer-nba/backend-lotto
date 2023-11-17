const route = require('express').Router()
const admins = require('../controllers/admin.controller.js')

// middleware
const verifyToken = require('../middleware/verifyToken.js')

// Admin routes control
route.post('/login', admins.login)
route.post('/register', admins.register)
route.delete('/delete/:id', verifyToken, admins.deleteAdmin)
route.get('/all', verifyToken, admins.getAllAdmin)

route.get('/sellers', verifyToken, admins.getAllSellers)
route.delete('/sellers', verifyToken, admins.deleteAllSellers)
route.put('/sellers/edit/:id', verifyToken, admins.editSellerStatus)
route.delete('/sellers/delete/:id', verifyToken, admins.deleteSeller)

route.delete('/lottos', verifyToken, admins.deleteAllLottos)
route.get('/lottos', verifyToken, admins.getAllLottos)

route.get('/users', verifyToken, admins.getAllUsers)
route.delete('/users', verifyToken, admins.deleteAllUsers)



module.exports = route