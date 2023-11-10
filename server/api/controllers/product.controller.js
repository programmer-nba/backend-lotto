// import database
const Lotto = require('../models/Lotteries/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')

exports.addLottos = async (req, res)=>{
    try{
        const userId = req.user.id
        const userRole = req.user.seller_role
        const userStatus = req.user.status

        const {
            number, // หมายเลขฉลาก
            type, // ประเภทหวย
            cost,
            price
        } = req.body

        const seller = await Seller.findById(userId)
        const shopname = seller.shop_name

        const newLotto = 
            {
                seller_id: userId,
                shopname: shopname,
                type: type, // ประเภทฉลาก (หวยเดี่ยว, หวยชุด, หวยกล่อง...)
                number: number, // หมายเลขฉลาก
                amount: number.length,
                period: "16 พฤศจิกายน 2566", // งวดที่ออก
                cost: cost,
                price: price,
                profit: price-cost,
                totlal_profit: (price-cost)*number.length
            }

        const lotto = await Lotto.create(newLotto)

        if(lotto){
            res.send({
                message: "เพิ่มฉลากสมบูรณ์",
                data:lotto,
                success: true,
            })
        }
        else {
            res.send({
                message: 'ไม่สามารถเพิ่มฉลากได้',
                success: false
            })
        }
    }
    catch(error){
        console.log(error.message)
        res.status(500).send(error.message)
    }
}