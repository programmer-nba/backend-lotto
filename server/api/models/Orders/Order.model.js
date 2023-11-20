const mongoose = require('mongoose')
const {Schema} = mongoose

const orderSchema = new Schema(
    {
        lotto_id: Array,
        buyer_id: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller'
        },
        seller_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller'
        },
        bill_no: String,
        order_no: String,
        status: String
    },
    {
        timestamps: true
    }
)

const Order = mongoose.model('Order', orderSchema)
module.exports = Order