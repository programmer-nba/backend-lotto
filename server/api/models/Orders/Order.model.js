const { Timestamp } = require('mongodb')
const mongoose = require('mongoose')
const {Schema} = mongoose

const orderSchema = new Schema(
    {
        order_no: String,
        lotto_id: Array,

        buyer: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller'
        },

        seller:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller'
        },
        
        status: String, // new > timeout, cancle, accepted > cancle, ready > 
        statusHis: [
            {
                name: String,
                status: String,
                timeAt: Date
            },
        ],

        transferBy: mongoose.Schema.Types.Mixed, // รับเอง, จัดส่ง
       
        detail: {
            seller: String,
            buyer: String,
            msg: String
        }, // ข้อความ

        paid: Boolean,
        bill_no: String,
        price: {
            each_lotto: { // ราคาหวยต่อใบ = 80.-
                type: Number,
                default: 80
            }, 
            all_lottos: Number, // ราคาหวยรวมทุกใบ = 80*amount
            retail_service: Number, // ค่าบริการจัดหาฉลาก = total - transfer - all_lottos
            wholesale_service: Number, // ค่าบริการจัดหาฉลาก = total - transfer - all_lottos
            transfer: Number, // ค่าส่ง
            total_retail: Number, // ราคารวมทั้งหมด
            total_wholesale: Number // ราคารวมทั้งหมด
        },

        paid_slip: String, // สลิปโอนเงิน
        receipt: String, // ใบเสร็จรับเงิน

        discount: {
            text: String,
            amount: Number
        }
    },
    {
        timestamps: true
    }
)

const Order = mongoose.model('Order', orderSchema)
module.exports = Order