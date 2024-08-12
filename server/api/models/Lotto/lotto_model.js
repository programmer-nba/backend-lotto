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
        status: { type: String, default: "selling" }, // สถานะ
        price: { type: Number, require: true, default: 80 },
        conflict: { type: Boolean, default: false }
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
        shop: { type: Object, require: true }, // ร้านค้า
        status: { type: String, default: "selling" }, // สถานะ
        price: { type: Number, require: true, default: 80 },
        conflict: { type: Boolean, default: false }
    },
    {
        timestamps: true,
    }
)

const LottoRetail = mongoose.model('LottoRetail', lottoRetailSchema)


module.exports = { LottoWholesale, LottoRetail }