const mongoose = require('mongoose')
const {Schema} = mongoose

const orderSchema = new Schema(
    {
        lotto_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lotto'
        },
        buyer_id: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller'
        },
        bill_no: String,
    },
    {
        timestamps: true
    }
)

const Order = mongoose.model('Order', orderSchema)
module.exports = Order