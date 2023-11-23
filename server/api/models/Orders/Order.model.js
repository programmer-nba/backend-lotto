const mongoose = require('mongoose')
const {Schema} = mongoose

const orderSchema = new Schema(
    {
        lotto_id: Array,
        buyer: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller'
        },
        seller:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller'
        },
        bill_no: String,
        order_no: String,
        status: String, // new > timeout, cancle, accepted > cancle, ready > 
        transferBy: mongoose.Schema.Types.Mixed, // รับเอง, จัดส่ง
        transfer_cost: Number, // ค่าจัดส่ง
        receipt: String, // ใบเสร็จรับเงิน
        paid_slip: String, // สลิปโอนเงิน
        detail: mongoose.Schema.Types.Mixed, // ข้อความ
        lottos_price: Number // ราคาสินค้ารวมในออร์เดอร์
    },
    {
        timestamps: true
    }
)

const Order = mongoose.model('Order', orderSchema)
module.exports = Order