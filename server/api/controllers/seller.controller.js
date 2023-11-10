const Lotto = require('../models/Lotteries/lotto.model.js')

exports.getMyLottos = async (req, res) => {
    try{
        const userId = req.user.id
        console.log(userId)
        const userRole = req.user.role
        console.log(userRole)

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