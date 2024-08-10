const mongoose = require('mongoose')
const { Schema } = mongoose

const cartSchema = new Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        item_id: { type: String, require: true },
        expire: { type: Date, require: true },
    },
    {
        timestamps: true
    }
)
const Cart = mongoose.model('Cart', cartSchema)

const expireCartTimeSchema = new Schema(
    {
        minute: { type: Number, require: true, default: 15 },
    },
    {
        timestamps: true
    }
)
const ExpireCartTime = mongoose.model('ExpireCartTime', expireCartTimeSchema)

module.exports = { Cart, ExpireCartTime }