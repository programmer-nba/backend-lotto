const mongoose = require('mongoose')
const {Schema} = mongoose

const configSchema = new Schema(
    {
        // period
        period: String,
    }
)

const Config = mongoose.model("Config", configSchema)
module.exports = Config