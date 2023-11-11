// import database
const Lotto = require('../models/Lotteries/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')

const addtoMarket = (req, res) => {
    // wait
}

exports.addLottos = async (req, res)=>{
    try{
        const userId = req.user.id
        const sellerRole = req.user.seller_role
        const userStatus = req.user.status

        const {
            number, // หมายเลขฉลาก
            type, // ประเภทหวย
            cost, // ต้นทุนหวย/ใบ
            price, // ราคาขายหวย/ใบ

            retail, // boolean
            wholesale // boolean

        } = req.body

        const seller = await Seller.findById(userId)
        const shopname = seller.shop_name

        // run on admin site----------------------------

        const year = "25" + number[0] + number[1]
        const day = number[3] + number[4]
        
        const now = new Date()
        const monthIndex = now.getMonth()
        const months = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤษจิกายน", "ธันวาคม"
        ]

        const currentMonth = months[monthIndex]

        const period = `${day} ${currentMonth} ${year}`

        //----------------------------------------------

        const amount = 
            (type==='หวยเล่ม') ? 100 : 1

        const market = 
            (retail===true && wholesale===false) ? "retail" :
            (retail===false && wholesale===true) ? "wholesale" :
            (retail===true && wholesale===true) ? "all" :
            "none"

        const newLotto = 
            {
                seller_id: userId,
                shopname: shopname,
                type: type, // ประเภทฉลาก (หวยเดี่ยว, หวยชุด, หวยกล่อง...)
                number: number, // หมายเลขฉลาก xx-xx-xx-xxxxxx-xxxx
                amount: amount, // จำนวนหวย ใบ
                period: period, // งวดที่ออก
                cost: cost,
                price: price,
                profit: price-cost,
                market: market, // ตลาดที่หวยชุดนี้ลงขาย
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