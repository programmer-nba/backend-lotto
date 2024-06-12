const mongoose = require('mongoose')
const { Schema } = mongoose

const notifySchema = new Schema(
    {
        to: { type: String, require: true }, // user _id
        title: { type: String, require: true },
        detail: { type: String, default: "" },
        from: { type: String, default: "" }, // sender name
        icon: { type: String, default: "" }, // sender image
        status: { type: String, default: "unread", enum: ["read", "unread"] }
    },
    {
        timestamps: true
    }
)

const Notify = mongoose.model('Notify', notifySchema)
module.exports = Notify