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
        status: { type: Number, default: 1 }, // สถานะ 1 = กําลังขาย, 0 = หยุดขาย, 2 = อยู่ในออร์เดอร์, 3 = ซื้อขายสำเร็จ, 4 = ขายหน้าร้าน
        price: { type: Number, require: true }, // ราคาแถว
        cost: { type: Number, require: true, default: 0 },
        profit: { type: Number, require: true, default: 0 },
        user: { type: String, default: null },
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
        status: { type: Number, default: 1 }, // สถานะ 1 = กําลังขาย, 0 = หยุดขาย, 2 = อยู่ในออร์เดอร์, 3 = ซื้อขายสำเร็จ, 4 = ขายหน้าร้าน
        price: { type: Number, require: true }, // ราคาแถว
        cost: { type: Number, require: true, default: 0 },
        profit: { type: Number, require: true, default: 0 },
        user: { type: String, default: null },
    },
    {
        timestamps: true,
    }
)

const RowLottoRetail = mongoose.model('RowLottoRetail', rowLottoRetailSchema)


module.exports = { RowLottoWholesale, RowLottoRetail }