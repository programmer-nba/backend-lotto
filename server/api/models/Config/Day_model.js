const mongoose = require('mongoose')
const {Schema} = mongoose

const daySchema = new Schema(
    {
        open_wholesale: { type: Boolean, default: true },
        open_retail: { type: Boolean, default: true },
        period: { 
            day: { type: Number, default: 1, min: 1, max: 31 },
            month: { type: Number, min: 1, max: 12, default: 1 },
            year: { type: Number, min: 2567, default: 2567 },
            time: { type: String, default: "00:00:00" },
            date: { type: Date },
            text: { type: String }
        },
        close: { 
            day: { type: Number, default: 1, min: 1, max: 31 },
            month: { type: Number, min: 1, max: 12, default: 1 },
            year: { type: Number, min: 2567, default: 2567 },
            time: { type: String, default: "00:00:00" },
            date: { type: Date },
            text: { type: String }
        },
        open: { 
            day: { type: Number, default: 1, min: 1, max: 31 },
            month: { type: Number, min: 1, max: 12, default: 1 },
            year: { type: Number, min: 2567, default: 2567 },
            time: { type: String, default: "00:00:00" },
            date: { type: Date },
            text: { type: String }
        },
    },
    {
        timestamps: true
    }
)

const Day = mongoose.model("Day", daySchema)
module.exports = Day