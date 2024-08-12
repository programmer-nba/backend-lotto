const mongoose = require("mongoose");
const { Schema } = mongoose;

const rowLottoWholesaleSchema = new Schema(
    {
        lottos: { type: Array, require: true }, // เลข qrcode ของรายการชุด
        year: { type: String, require: true }, // ปี
        period: { type: String, require: true }, // งวดที่
        type: { type: String, default: "หวยแถว" }, // ประเภทสลาก
        market: { type: String, require: true, default: "wholesale" }, // ตลาด
        qty: { type: Number, require: true }, // จำนวนเลขชุด
        length: { type: Number, require: true }, // จำนวนชุดในแถว
        shop: { type: Object, require: true }, // ร้านค้า
        status: { type: String, default: "selling" }, // สถานะ
        price: { type: Number, require: true } // ราคาแถว
    },
    {
        timestamps: true,
    }
)
const RowLottoWholesale = mongoose.model('RowLottoWholesale', rowLottoWholesaleSchema)

const rowLottoRetailSchema = new Schema(
    {
        lottos: { type: Array, require: true }, // เลข qrcode ของรายการชุด
        year: { type: String, require: true }, // ปี
        period: { type: String, require: true }, // งวดที่
        type: { type: String, default: "หวยแถว" }, // ประเภทสลาก
        market: { type: String, require: true, default: "retail" }, // ตลาด
        qty: { type: Number, require: true }, // จำนวนเลขชุด
        length: { type: Number, require: true }, // จำนวนชุดในแถว
        shop: { type: Object, require: true }, // ร้านค้า
        status: { type: String, default: "selling" }, // สถานะ
        price: { type: Number, require: true } // ราคาแถว
    },
    {
        timestamps: true,
    }
)

const RowLottoRetail = mongoose.model('RowLottoRetail', rowLottoRetailSchema)


module.exports = { RowLottoWholesale, RowLottoRetail }