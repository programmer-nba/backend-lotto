const mongoose = require('mongoose')
const { Schema } = mongoose

const userAddressSchema = new Schema(
    {
        title: { type: String, require: true }, // บ้าน, ที่ทำงาน
        owner: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "Client" },
        houseNo: { type: String, require: true }, // บ้านเลขที่ หมู่ ซอย
        province: { type: String, require: true }, // จังหวัด
        district: { type: String, require: true }, // อำเภอ
        subDistrict: { type: String, require: true }, // ตำบล
        zipcode: { type: String, require: true }, // เลขไปรษณีย์
        fullAddress: { type: String, require: true }, // ที่อยู่เต็ม
        phone: { type: String, require: true }, // เบอร์โทรผู้รับ
        name: { type: String, require: true }, // ชื่อผู้รับ
    },
    {
        timestamps: true
    }
)
const UserAddress = mongoose.model('UserAddress', userAddressSchema)
module.exports = UserAddress