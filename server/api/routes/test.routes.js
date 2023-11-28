const route = require('express').Router()
const {upload, uploadPictures} = require('../middleware/drive.js')

route.post('/upload', upload, uploadPictures, (req, res) => {
    const dataIds = req.dataIds
    res.send(dataIds[0])
})

module.exports = route