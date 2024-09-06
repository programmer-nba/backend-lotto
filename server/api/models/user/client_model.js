const mongoose = require('mongoose');
const { Schema } = mongoose;

const clientSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
        displayName: { type: String, required: true },
        email: { type: String, default: "" },
        address: { type: String, default: "" },
        phone: { type: String, required: false },
        lineId: { type: String, default: null },
        linePicture: { type: String, default: null },
        facebookId: { type: String, default: null },
        prefixName: { type: String, default: "" },
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        approveRefs: { type: Array, default: [] },
        active: { type: Boolean, default: true },
        role: { type: String, default: 'user' },
        code: { type: String, required: true },
    },
    {
        timestamps: true
    }
)

const Client = mongoose.model('Client', clientSchema)
module.exports = Client