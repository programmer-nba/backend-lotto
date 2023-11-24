const mongoose = require('mongoose')
const {Schema} = mongoose

const daySchema = new Schema(
    {
        day: [
            {
            type: String,
        }
        ],
        open_markets: {
            wholesale: Boolean,
            retail: Boolean
        },
    }
)

const Day = mongoose.model("Day", daySchema)
module.exports = Day