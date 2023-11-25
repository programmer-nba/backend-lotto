// import database
const { Timestamp } = require('mongodb')
const Lotto = require('../models/Products/lotto.model.js')
const User = require('../models/UsersModel/UsersModel.js')

// get my all lotteries data
exports.getMyLottos = async (req, res) => {
    try{
        const userId = req.user.id
        const userRole = req.user.role
        
        if(userRole !== 'seller'){
            res.send({message:"คุณไม่ใช่ seller ไม่สามารถเข้าถึงข้อมูลได้"})
        }

        const myLottos = await Lotto.find({seller_id: userId})
        console.log(myLottos)

        if(myLottos){
            res.send(myLottos)
        }
    }
    catch(err){
        console.log(err.message)
        res.send({message:"ERROR : please check console"})
    }
}

// update profile
exports.editMyProfile = async (req, res)=> {
    const dataIds = req.dataIds
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
        
        user.name= name
        user.address= address
        user.line_id= line_id
        user.updatedAt= new Timestamp()

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
