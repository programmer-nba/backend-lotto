const mongoose = require('mongoose')
const {Schema} = mongoose

const SellerSchema = new Schema(
    {
        status: {
            type: String,
            default: 'กำลังตรวจสอบ'
        },

        // main infomaion
        email: {
            type: String,
            
        },
        password: {
            type: String,
            require: true
        },
        role: {
            type: String,
            
        },
        seller_role: {
            type: String,
        },

        // owner profile
        line_id: {
            type: String,
            
        },
        name: {
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
            type: String,
        },

        // shop profile
        shop_name: {
            type: String,
            
        },
        shop_location: {
            type: String,
            
        },
        shop_img: {
            type: String,
            
        },
        shop_bank: {
            type: String,
            
        }, 
        shop_logo: {
            type: String,
        },
        
    },
    {
        timestamps: true
    },
    
)

const  Seller = mongoose.model('Seller',  SellerSchema)
module.exports =  Seller