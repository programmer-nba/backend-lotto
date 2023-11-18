const mongoose = require('mongoose')
const {Schema} = mongoose

const preorderSchema = new Schema(
    {
        lotto_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'lotto'
        },
        buyer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller'
        },
        bill_no: String,
        status: {
            type: String,
            default: 'กำลังรอร้านค้ายืนยัน...'
        }
    },
    {
        timestamps: true
    }
)

const Preorder = mongoose.model('Preorder', preorderSchema)
module.exports = Preorder