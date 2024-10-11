const mongoose = require('mongoose');
const { Schema } = mongoose;

const shopSchema = new Schema(
    {
        code: { type: String, require: true },
        owner: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        name: { type: String, require: true },
        address: { type: String, require: true },
        phone: { type: String, require: true },
        email: { type: String, default: "" },
        //profilePicture: { type: String, default: ""},
        type: { type: String, require: true },
        active: { type: Boolean, require: true, default: false },
        status: { type: String, require: true, default: "pending" },
        description: { type: String, default: "" },
        socials: { type: Array, default: [] },
        //approveRefs: { type: Array, default: [] },
        bankNumber: { type: String, default: "" },
        bankHolder: { type: String, default: "" },
        bankProvider: { type: String, default: "" },
        bankBranch: { type: String, default: "" },
        idCardNumber: { type: String, default: "" },

        deliveryMethods: { type: Array, default: [
            {
                name: "รถตู้",
                price: 50
            }
        ] },
    },
    {
        timestamps: true
    }
)

const Shop = mongoose.model('Shop', shopSchema)
module.exports = Shop