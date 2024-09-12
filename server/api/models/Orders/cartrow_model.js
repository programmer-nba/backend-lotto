const mongoose = require('mongoose')
const { Schema } = mongoose

const cartRowSchema = new Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        item_id: { type: String, require: true },
        expire: { type: Date, require: true },
    },
    {
        timestamps: true
    }
)
const CartRow = mongoose.model('CartRow', cartRowSchema)

const expireCartRowTimeSchema = new Schema(
    {
        minute: { type: Number, require: true, default: 15 },
    },
    {
        timestamps: true
    }
)
const ExpireCartRowTime = mongoose.model('ExpireCartRowTime', expireCartRowTimeSchema)

module.exports = { CartRow, ExpireCartRowTime }