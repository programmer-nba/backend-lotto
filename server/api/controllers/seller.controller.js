// import database
const Lotto = require('../models/Lotteries/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')

// get my all lotteries data
exports.getMyLottos = async (req, res) => {
    try{
        const userId = req.user.id
        const userRole = req.user.role
        
        if(userRole !== 'seller'){
            res.send({message:"คุณไม่ใช่ seller ไม่สามารถเข้าถึงข้อมูลได้"})
        }

        const myLottos = await Lotto.find({seller_id: userId})

        if(myLottos){
            res.send({
                count: `หวยของฉันมีทั้งหมด ${myLottos.length} ชุด`,
                myLottos
            })
        }
    }
    catch(err){
        console.log(err.message)
        res.send({message:"ERROR : please check console"})
    }
}

// update profile
exports.editMyProfile = async (req, res)=> {
    try{
        
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