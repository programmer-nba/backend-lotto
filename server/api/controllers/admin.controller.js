const Lotto = require("../models/Lotteries/lotto.model")

// Delete All lotteries from database
exports.deleteAllLotto = async (req, res) => {
    try{
        const userRole = req.user.role
        if(userRole !== 'admin'){
            res.send({message:"คุณไม่ใช่ admin ไม่สามารถทำรายการได้"})
        }

        await Lotto.deleteMany()
        const lottosAmount = await Lotto.find()
        
        if(lottosAmount.length > 0){
            res.send({message: "เกิดข้อผิดพลาด ไม่สามารถลบฉลากได้"})
        }

        res.send({
            message: "ลบฉลากทั้งหมดแล้ว",
            amout: `ฉลากในระบบเหลือ ${lottosAmount.length}`
        })
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({message:"ERROR! please check console"})
    }
}