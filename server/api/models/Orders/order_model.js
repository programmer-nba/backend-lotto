const mongoose = require('mongoose')
const { Schema } = mongoose

const orderWholesaleSchema = new Schema(
    {
        code: { type: String, require: true },
        user: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        userAddress: { type: String, require: true, default: "" },
        vatPercent: { type: Number, require: true },
        totalPrice: { type: Number, require: true },
        totalDiscount: { type: Number, require: true },
        totalVat: { type: Number, require: true },
        totalNet: { type: Number, require: true },
        items: { type: Array, require: true },
        discount: { type: String, default: "" },
        status: { type: Number, require: true, default: 1 },
        shop: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Shop" },
        transferBy: { type: String, default: "" }, 
        transferPrice: { type: Number, default: 0 }, 
        deliveryMethod: { type: String, default: "" }
    },
    {
        timestamps: true
    }
)
const OrderWholesale = mongoose.model('OrderWholesale', orderWholesaleSchema)

const orderWholesaleCountSchema = new Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "OrderWholesale" },
    },
    {
        timestamps: true
    }
)
const OrderWholesaleCount = mongoose.model('OrderWholesaleCount', orderWholesaleCountSchema)

const orderWholesaleLogSchema = new Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "OrderWholesale" },
        status: { type: Number, require: true },
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
        code: { type: String, require: true },
        user: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        userAddress: { type: String, require: true },
        vatPercent: { type: Number, require: true },
        totalPrice: { type: Number, require: true },
        totalDiscount: { type: Number, require: true },
        totalVat: { type: Number, require: true },
        totalNet: { type: Number, require: true },
        items: { type: Array, require: true },
        discount: { type: String, default: "" },
        status: { type: Number, require: true, default: 1 },
        shop: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Shop" },
    },
    {
        timestamps: true
    }
)
const OrderRetail = mongoose.model('OrderRetail', orderRetailSchema)

const orderRetailCountSchema = new Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "OrderRetail" },
    },
    {
        timestamps: true
    }
)
const OrderRetailCount = mongoose.model('OrderRetailCount', orderRetailCountSchema)

const orderRetailLogSchema = new Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "OrderRetail" },
        status: { type: Number, require: true },
        user: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        shop: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Shop" },
    },
    {
        timestamps: true
    }
)
const OrderRetailLog = mongoose.model('OrderRetailLog', orderRetailLogSchema)

module.exports = {OrderWholesale, OrderWholesaleCount, OrderWholesaleLog, OrderRetail, OrderRetailCount, OrderRetailLog}