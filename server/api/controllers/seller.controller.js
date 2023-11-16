// import database
const Seller = require('../models/UsersModel/SellersModel.js')

// update profile
exports.editMyProfile = async (req, res)=> {
    try{

        const {
            
        }=req.body
        
        const userId = req.user.id

        await Seller.findByIdAndUpdate(userId, req.body)

        res.send({
            message:"อัพเดทข้อมูลส่วนตัวเสร็จสิ้น",
        })
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
}