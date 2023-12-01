// import database
const Lotto = require('../models/Products/lotto.model.js')
const User = require('../models/UsersModel/UsersModel.js')

// update profile
exports.editMyProfile = async (req, res)=> {
    
    try{
        const userId = req.user.id
        const {
            name,
            address,
            line_id
        } = req.body

        const user = await User.findById(userId)
        if(!user){
            return res.send({message:"ไม่พบข้อมูลผู้ใช้งาน"})
        }

        let newAddress = {
            province: (address.province!=='') ? address.province : user,
            district: address.district,
            subdistrict: address.subdistrict,
            postcode: address.postcode,
            address: address.address
        }
        
        user.name= name
        user.address= newAddress
        user.line_id= line_id
        user.updatedAt= new Date()

        const updated_user = await user.save()
        if(!updated_user){
            return res.send({message:"ไม่สามารถอัพเดทข้อมูลได้"})
        }

        return res.send({
            message:"อัพเดทข้อมูลส่วนตัวเสร็จสิ้น",
            user: updated_user
        })
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
}


