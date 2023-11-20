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
        number: Array, // หมายเลขฉลาก
        set: Array, // ชุดที่
        book: String, // เล่มที่
        six_number: String, // เลข 6 หลัก
        pcs: Number, // จำนวนหวย (ใบ)

        amount: Number, // จำนวนใบ
        period: String, // งวดที่ออก
        cost: Number, // ราคาทุน
        price: Number, // ราคาขาย
        profit: Number, // กำไร
        totlal_profit: Number, // กำไรรวมทั้งชุด

        on_order: Boolean, 
    },
    {
        timestamps: true
    }
)

const Lotto = mongoose.model('Lotto', lottoSchema)
module.exports = Lotto