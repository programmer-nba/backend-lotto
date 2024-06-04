const mongoose = require('mongoose')
const { Schema } = mongoose

const transferCostSchema = new Schema({
    name: String,
    price: Number,
    seller_id: String,
    active: { type: Boolean, default: true }
})

module.exports = mongoose.model('TransferCost', transferCostSchema)