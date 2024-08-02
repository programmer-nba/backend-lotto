const mongoose = require('mongoose')
const { Schema } = mongoose

const orderWholesaleSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        userAddress: { type: String, require: true },
        vatPercent: { type: Number, require: true },
        totalPrice: { type: Number, require: true },
        totalDiscount: { type: Number, require: true },
        totalVat: { type: Number, require: true },
        totalNet: { type: Number, require: true },
        items: { type: Array, require: true },
        discount: { type: String, default: "" },
        status: { type: String, require: true, default: "pending" },
        shop: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Shop" },
    },
    {
        timestamps: true
    }
)
const OrderWholesale = mongoose.model('OrderWholesale', orderWholesaleSchema)

const orderWholesaleLogSchema = new Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "OrderNew" },
        status: { type: String, require: true },
        user: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        shop: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Shop" },
    },
    {
        timestamps: true
    }
)
const OrderWholesaleLog = mongoose.model('OrderWholesaleLog', orderWholesaleLogSchema)

const orderRetailSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        userAddress: { type: String, require: true },
        vatPercent: { type: Number, require: true },
        totalPrice: { type: Number, require: true },
        totalDiscount: { type: Number, require: true },
        totalVat: { type: Number, require: true },
        totalNet: { type: Number, require: true },
        items: { type: Array, require: true },
        discount: { type: String, default: "" },
        status: { type: String, require: true, default: "pending" },
        shop: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Shop" },
    },
    {
        timestamps: true
    }
)
const OrderRetail = mongoose.model('OrderRetail', orderRetailSchema)

const orderRetailLogSchema = new Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "OrderNew" },
        status: { type: String, require: true },
        user: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        shop: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Shop" },
    },
    {
        timestamps: true
    }
)
const OrderRetailLog = mongoose.model('OrderRetailLog', orderRetailLogSchema)

module.exports = {OrderWholesale, OrderWholesaleLog, OrderRetail, OrderRetailLog}