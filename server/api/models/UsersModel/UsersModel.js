const mongoose = require('mongoose')
const {Schema} = mongoose

const UserSchema = new Schema(
    {
        name: {
            type: String,
        },
        address: {
            type: mongoose.Schema.Types.Mixed,
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
        last_logedIn: Date,
        last_logedInHis: [{
            date: Date,
            IP: String,
        }],
        
        profile_img: String,
        cover_img: String
        
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', UserSchema)
module.exports = User