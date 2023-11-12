// import database
const Lotto = require('../models/Products/lotto.model.js')
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

exports.addLottos = async (req, res)=>{
    try{
        const userId = req.user.id

        const {
            number, // หมายเลขฉลาก
            type, // ประเภทหวย
            cost, // ต้นทุนหวย/ใบ
            price, // ราคาขายหวย/ใบ
            amount, // จำนวนชุด
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

        const unit = 
            (type==='หวยเล่ม') ? 'เล่ม' :
            (type==='หวยชุด') ? 'ชุด' :
            'หน่วย'

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
                message: `เพิ่มฉลากแล้ว : ${type} จำนวน ${amount} ${unit} ลงขายในตลาด ${market}`,
                data:lotto,
                unit: unit,
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

exports.deleteMyLotto = async (req, res) => {
    try{
        
        const {id} = req.params

        const deletedProduct = await Lotto.findByIdAndDelete(id)

        if(!deletedProduct){
            res.send({message:"ไม่พบสินค้าในระบบ", success:false})
        }

        return res.status(200).send({
            message: "ลบสินค้าเรียบร้อย",
            success: true
        })
        
    }
    catch(error){
        console.log(error.message)
        res.send({
            message: 'เกิดข้อผิดพลาด ลองตรวจสอบสาเหตุใน console',
            success: false
        })
    }
}

exports.deleteMyLottos = async (req, res) => {
    try{
        const userId = req.user.id
        const products = await Lotto.find({seller_id: userId})

        if(!products || products.length === 0){
            res.send({message:"ไม่พบสินค้าในระบบ", success:false})
        } 

        const result = await Lotto.deleteMany({seller_id: userId})
        
        if(!result){
            res.send({message:"ไม่สามารถลบสินค้าได้", success:false})
        }

        return res.status(200).send({
            message: "ลบสินค้าทั้งหมดเรียบร้อย",
            success: true
        })
        
    }
    catch(error){
        console.log(error.message)
        res.send({
            message: 'เกิดข้อผิดพลาด ลองตรวจสอบสาเหตุใน console',
            success: false
        })
    }
}