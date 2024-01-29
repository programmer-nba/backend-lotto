const mongoose = require('mongoose')
const { Schema } = mongoose

const chatSchema = new Schema(
    {
        orderId: String,
        name: String,
        messages: [
            {
                sender: String,
                message: String,
                date: String,
                time: String,
                img: String
            }
        ],
        members : [
            {
                id: String,
                name: String,
                role: String,
                srole: String,
                img: String,
                phone: String,
            }
        ],
        createAt: {
            type: Date,
            default: Date.now()
        }
    }
)

const Chat = mongoose.model('Chat', chatSchema)
module.exports = Chat