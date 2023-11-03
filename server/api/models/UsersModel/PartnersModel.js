const mongoose = require('mongoose')
const {Schema} = mongoose

const PartnerSchema = new Schema(
    {
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
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
        },
        shopName: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const  Partner = mongoose.model(' Partner',  PartnerSchema)
module.exports =  Partner