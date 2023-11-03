const mongoose = require('mongoose')
const {Schema} = mongoose

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true
        },
        email: {
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
        lineId: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', UserSchema)
module.exports = User