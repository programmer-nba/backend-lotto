const mongoose = require('mongoose')
const {Schema} = mongoose

const SellerSchema = new Schema(
    {
        status: {
            type: String,
            default: 'pending'
        },

        // main infomaion
        username: {
            type: String,
            require: true
        },
        email: {
            type: String,
            
        },
        password: {
            type: String,
            require: true
        },
        role: {
            type: String,
            required: true
        },

        // owner profile
        line_id: {
            type: String,
            
        },
        first_name: {
            type: String,
            
        },
        last_name: {
            type: String,
            
        },
        phone_number: {
            type: String,
            
        },
        address: {
            type: String,
            
        },
        personal_id: {
            type: String,
            
        },
        personal_img: {
            data: Buffer,
            contentType: String
        },

        // shop profile
        shop_name: {
            type: String,
            
        },
        shop_location: {
            type: String,
            
        },
        shop_img: {
            data: Buffer,
            contentType: String,
            
        },
        shop_bank: {
            data: Buffer,
            contentType: String,
            
        }, 
        shop_logo: {
            type: String,
            contentType: String,
        } 
    },
    {
        timestamps: true
    }
)

const  Seller = mongoose.model('Seller',  SellerSchema)
module.exports =  Seller