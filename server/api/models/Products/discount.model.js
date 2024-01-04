const mongoose = require('mongoose')
const { Schema } = mongoose

const discountSchema = new Schema(
    {
        code: String,
        lotto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lotto'
        },
        amount: Number
    }
)

const Discount = mongoose.model('Discount', discountSchema)
module.exports = Discount