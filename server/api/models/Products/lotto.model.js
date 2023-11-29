const mongoose = require('mongoose')
const {Schema} = mongoose

const lottoSchema = new Schema(
    {
        seller_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller'
        }, 
        shopname: String,
        buyer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        buyer_name: String,
        reward: Number,
        market: String,
        
        type: String, // ประเภทฉลาก (หวยเดี่ยว, หวยชุด, หวยกล่อง...)
        date: String,
        code: [{type: String}], // barcode หวย
        pcs: Number, // จำนวนหวย (ใบ)
        unit: String, // หน่วย
        amount: Number, // จำนวนใบ
        decoded: [
            {
                year: String,
                period: String,
                set: String,
                six_number: String,
                book: String,
            }
        ],
        cost: Number, // ราคาทุน
        price: Number, // ราคาขาย
        profit: Number, // กำไร
        totlal_profit: Number, // กำไรรวมทั้งชุด
        sold: {
            type: Boolean,
            default: false
        },
        on_order: Boolean, 
    },
    {
        timestamps: true
    }
)

const Lotto = mongoose.model('Lotto', lottoSchema)
module.exports = Lotto