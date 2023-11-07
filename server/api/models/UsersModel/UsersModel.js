const mongoose = require('mongoose')
const {Schema} = mongoose

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: false
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', UserSchema)
module.exports = User