const mongoose = require('mongoose')
const {Schema} = mongoose

const pictureSchema = new Schema({
    owner: String,
    imgLink: String,
    name: String,
    createAt: {
        type: Date,
        default: Date.now()
    }
})

const Picture = mongoose.model('Picture', pictureSchema)
module.exports = Picture