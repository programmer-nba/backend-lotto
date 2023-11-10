const route = require('express').Router()
const verifyToken = require('../../middleware/verifyToken.js')
const Lotto = require('../../models/Lotteries/lotto.model.js')

// ...../lotto/product/getall
route.get('/getall', verifyToken, async (req, res)=>{
    try{
        // check token is verified
        if(!req.user){
            res.send({message:'verify token error', success:false})
        }

        const lotteries = await Lotto.find()

        // check founded lottery in database
        if(!lotteries){
            res.send({message:"ไม่พบฉลากในระบบ", success: false})
        } else if(lotteries.length <= 0){
            res.send({message:"ไม่มีฉลากในระบบ กรุณารอผู้ขายเพิ่มฉลากใหม่", success: true})
        }

        

        res.send({
            message: `มีฉลากในระบบจำนวน ${lotteries.length} ชุด`,
            success: true,
            data: lotteries
        })

    }
    catch(error){
        console.log(error.message)
        res.status(500).send({
            message: "ERROR, please check console",
            success: false,
        })
    }
})

module.exports = route