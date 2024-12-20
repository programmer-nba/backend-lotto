const mongoose = require("mongoose");
const { Schema } = mongoose;

const lottoWholesaleSchema = new Schema(
    {
        code: { type: String, require: true }, // เลข qrcode
        year: { type: String, require: true }, // ปี
        period: { type: String, require: true }, // งวดที่
        set: { type: String, require: true }, // ชุดที่
        type: { type: String, default: "หวยชุด" }, // ประเภทสลาก
        market: { type: String, require: true, default: "wholesale" }, // ตลาด
        qty: { type: Number, require: true, default: 1 }, // จำนวนชุด
        number: { type: Array, require: true }, // เลข 6 หลัก
        shop: { type: String, require: true }, //id ร้านค้า
        status: { type: Number, default: 1 }, // สถานะ 1 = กําลังขาย, 0 = หยุดขาย, 2 = อยู่ในออร์เดอร์, 3 = ซื้อขายสำเร็จ, 4 = ขายหน้าร้าน, 5 = ย้ายร้านค้า
        price: { type: Number, require: true, default: 80 },
        cost: { type: Number, require: true, default: 0 },
        profit: { type: Number, require: true, default: 0 },
        conflict: { type: Boolean, default: false },
        user: { type: String, default: null },
    },
    {
        timestamps: true,
    }
)
const LottoWholesale = mongoose.model('LottoWholesale', lottoWholesaleSchema)

const lottoRetailSchema = new Schema(
    {
        code: { type: String, require: true }, // เลข qrcode
        year: { type: String, require: true }, // ปี
        period: { type: String, require: true }, // งวดที่
        set: { type: String, require: true }, // ชุดที่
        type: { type: String, default: "หวยชุด" }, // ประเภทสลาก
        market: { type: String, require: true, default: "retail" }, // ตลาด
        qty: { type: Number, require: true, default: 1 }, // จำนวนชุด
        number: { type: Array, require: true }, // เลข 6 หลัก
        shop: { type: String, require: true }, // ร้านค้า
        status: { type: Number, default: 1 }, // สถานะ 1 = กําลังขาย, 0 = หยุดขาย, 2 = อยู่ในออร์เดอร์, 3 = ซื้อขายสำเร็จ, 4 = ขายหน้าร้าน
        price: { type: Number, require: true, default: 80 },
        cost: { type: Number, require: true, default: 0 },
        profit: { type: Number, require: true, default: 0 },
        conflict: { type: Boolean, default: false },
        user: { type: String, default: null },
    },
    {
        timestamps: true,
    }
)

const LottoRetail = mongoose.model('LottoRetail', lottoRetailSchema)


module.exports = { LottoWholesale, LottoRetail }