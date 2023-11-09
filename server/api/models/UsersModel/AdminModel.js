const mongoose = require('mongoose')
const {Schema} = mongoose

const AdminSchema = new Schema(
    {
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
)

const Admin = mongoose.model('Admin', AdminSchema)
module.exports = Admin