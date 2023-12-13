const route = require('express').Router()
const admins = require('../controllers/admin.controller.js')
const pictures = require('../controllers/picture.controller.js')

// middleware
const verifyToken = require('../middleware/verifyToken.js')
const {upload, uploadPictures} = require('../middleware/drive.js')
const dateCheck = require('../middleware/dateCheck.js')

// Admin routes control
route.post('/login', admins.login)
route.post('/register', admins.register)
route.delete('/delete/:id', verifyToken, admins.deleteAdmin)
route.get('/all', verifyToken, admins.getAllAdmin)

route.get('/sellers', verifyToken, admins.getAllSellers)
route.get('/seller/:id', verifyToken, admins.getSeller)
route.delete('/sellers', verifyToken, admins.deleteAllSellers)
route.put('/sellers/edit/:id', verifyToken, admins.editSellerStatus)
route.delete('/sellers/delete/:id', verifyToken, admins.deleteSeller)

route.delete('/lottos', verifyToken, admins.deleteAllLottos)
route.get('/lottos', verifyToken, admins.getAllLottos)

route.get('/users', verifyToken, admins.getAllUsers)
route.delete('/users', verifyToken, admins.deleteAllUsers)

route.post('/config/date', verifyToken, admins.createConfigDate)
route.put('/config/date', verifyToken, admins.updateConfig)

// pictures of main page
route.post('/config/picture', verifyToken, upload.any(), uploadPictures, pictures.uploadAdminPicture)
route.get('/config/picture', verifyToken, pictures.getAdminPictures) 
route.get('/config/picture/:id', verifyToken, pictures.getAdminPicture) 
route.put('/config/picture/:id', verifyToken, upload.any(), uploadPictures, pictures.updateAdminPicture)
route.delete('/config/picture/:id', verifyToken, pictures.deleteAdminPicture)

route.get('/config/date', admins.getConfigDate)

module.exports = route