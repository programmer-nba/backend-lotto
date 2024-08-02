const mongoose = require('mongoose')
const { Schema } = mongoose

const discountTypeSchema = new Schema(
    {
        type: { type: String, require: true }, //capital, percent
        code: { type: String, require: true },
        active: { type: Number, require: true, default: 1 }, // active = 1, inactive = 0
    },
    {
        timestamps: true
    }
)
const DiscountType = mongoose.model('DiscountType', discountTypeSchema)

const discountShopSchema = new Schema(
    {
        type: { type: String, require: true }, //capital, percent
        code: { type: String, require: true },
        active: { type: Number, require: true, default: 1 }, // active = 1, inactive = 0
        amount: { type: Number, require: true, default: 0},
        shop: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Shop" },
    },
    {
        timestamps: true
    }
)
const DiscountShop = mongoose.model('DiscountShop', discountShopSchema)

module.exports = { DiscountType, DiscountShop }