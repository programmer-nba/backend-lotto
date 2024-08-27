const mongoose = require('mongoose')
const { Schema } = mongoose

const chatSchema = new Schema(
    {
        members : [{ type: String, require: true }],
        status: { type: Number, require: true, default: 1, enum: [1, 0] },
    },
    {
        timestamps: true
    }
)

const Chat = mongoose.model('Chat', chatSchema)
module.exports = Chat