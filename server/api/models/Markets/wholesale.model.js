const mongoose = require('mongoose')
const {Schema} = mongoose

const wholesaleSchema = new Schema(
    {
        lotto_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lotto"
        },
    },
    {
        timestamps: true
    }
)

const Wholesale = mongoose.model("Wholesale", wholesaleSchema)
module.exports = Wholesale