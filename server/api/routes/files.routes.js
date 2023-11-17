const route = require('express').Router()

const files = require('../controllers/uploadfile.js')

const multer = require('multer')

let storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
        const extension = file.originalname.split(".").pop()
        callback(null, `${file.fieldname}-${Date.now()}.${extension}`)
    }
})
const upload = multer({ storage: storage })

route.post('/', upload.single('file'), files.uploadFile)

module.exports = route