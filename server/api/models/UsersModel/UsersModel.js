const mongoose = require('mongoose')
const {Schema} = mongoose

const UserSchema = new Schema(
    {
        name: {
            type: String,
            
        },
        address: {
            type: String,

        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        phone_number: {
            type: String,
            required: true
        },
        line_id : {
            type: String,
        },
        last_logedIn: String,
        IP: String
        
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', UserSchema)
module.exports = User