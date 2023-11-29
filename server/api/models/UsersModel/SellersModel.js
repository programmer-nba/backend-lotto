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
            type: mongoose.Schema.Types.Mixed,
        },
        
        personal_id: {
            type: String,
            
        },

        // shop profile
        shop_name: {
            type: String,
            
        },
        shop_number: String,
        
        shop_location: {
            type: String,
        },
        personal_img: {
            type: String,
        },
        shop_img: {
            type: String,
            
        },
        shop_bank: {
            type: String,
            
        }, 
        shop_cover: {
            type: String,
        },
        personWithCard: String,
        personWithShop: String,

        last_logedIn: [{
            date: Date,
            IP: String,
        }],
    },
    {
        timestamps: true
    },
    
)

const  Seller = mongoose.model('Seller',  SellerSchema)
module.exports =  Seller