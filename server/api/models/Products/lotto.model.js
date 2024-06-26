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
        group: String,
        group_price_retail: Number,
        group_price_wholesale: Number,
        group_cost: Number,
        type: String, // ประเภทฉลาก (หวยเดี่ยว, หวยชุด, หวยกล่อง...)
        date: String,
        code: [{type: String}], // barcode หวย
        pcs: Number, // จำนวนหวย (ใบ)
        unit: String, // หน่วย
        amount: Number, // จำนวนใบ
        text: String,
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
        prices: {
            wholesale: {
                total: Number,
                service: Number,
                profit: Number
            },
            retail: {
                total: Number,
                service: Number,
                profit: Number
            },
        },
        profit: Number, // กำไร
        totlal_profit: Number, // กำไรรวมทั้งชุด
        sold: {
            type: Boolean,
            default: false
        },
        sold_data: {
            channel: String,
            descript: String,
            price: Number
        },
        on_order: Boolean, 
        cut_stock: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
)

const Lotto = mongoose.model('Lotto', lottoSchema)
module.exports = Lotto