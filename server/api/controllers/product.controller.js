// import database
const Lotto = require('../models/Products/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')

// get my all lotteries data
exports.getMyLottos = async (req, res) => {
    try{
        const userId = req.user.id
        const userRole = req.user.role
        
        if(userRole !== 'seller'){
            return res.send({message:"คุณไม่ใช่ seller ไม่สามารถเข้าถึงข้อมูลได้"})
        }

        const myLottos = await Lotto.find({seller_id: userId})

        if(myLottos){
            return res.send({
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

// create new lotto set
exports.addLottos = async (req, res)=>{
    try{
        const userId = req.user.id

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

        // will run on admin site----------------------------

        const year = "25" + number[0][0] + number[0][1]
        const day = number[0][3] + number[0][4]
        
        const now = new Date()
        const monthIndex = now.getMonth()
        const months = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤษจิกายน", "ธันวาคม"
        ]

        const currentMonth = months[monthIndex]

        const period = `${day} ${currentMonth} ${year}`

        //----------------------------------------------

        const amount = number.length
    
        const unit = 
            (type==='หวยเล่ม' || type==='หวยก้อน') ? 'เล่ม' :
            (type==='หวยชุด') ? 'ชุด' :
            'หน่วย'

        const market = 
            (retail===true && wholesale===false) ? "retail" :
            (retail===false && wholesale===true) ? "wholesale" :
            (retail===true && wholesale===true) ? "all" :
            "none"

        let number_stock = [] // โค้ดหวย
        
        let set_stock = [] // ชุดที่
        
        for(let i in number){
            let number_decoded = 
            (type==='หวยก้อน' || type==='หวยเล่ม') ? `${number[i].substring(0, 9) + 'xxxxxx' + number[i].substring(14+1)}`
            : number[i]
            number_stock.push(number_decoded)

            let set_decoded = number[i].substring(6, 7+1)
            set_stock.push(set_decoded)
        }

        const book = `${number[0].substring(16,19) + number[0].substring(19)}` // เล่มที่

        const set_string = set_stock.join(", ")

        const six_number = (type==='หวยเล่ม') ? `xxxx00-xxxx99`
        : (type==='หวยก้อน') ? `xxxx00-xxxx99 x${amount}`
        : number[0].substring(9, 14+1)

        const pcs =
            (type==='หวยเล่ม') ? 100 :
            (type==='หวยก้อน') ? amount*100 :
            amount

        const newLotto = 
            {
                seller_id: userId,
                shopname: shopname,
                type: type, // ประเภทฉลาก (หวยเดี่ยว, หวยชุด, หวยก้อน, หวยกล่อง...)
                number: number_stock, // หมายเลขฉลาก xx-xx-xx-xxxxxx-xxxx
                six_number: six_number, // เลข 6 หลัก
                amount: amount, // จำนวนหวย (ชุด)
                period: period, // งวดที่ออก
                book: book, // เล่มที่
                set: set_stock, // ชุดที่
                cost: cost,
                price: price,
                profit: price-cost,
                market: market, // ตลาดที่หวยชุดนี้ลงขาย
                pcs: pcs, // จำนวนหวย (ใบ)
                on_order: false, // 
            }

        const lotto = await Lotto.create(newLotto)

        if(lotto){
            res.send({
                message: `เพิ่มฉลากแล้ว : ${type} จำนวน ${amount} ${unit} ลงขายในตลาด ${market} หมายเลข 6 หลัก = ${six_number} ชุดที่ = ${set_string} เล่มที่ = ${book}`,
                data:lotto,
                six_number: six_number,
                set: set_string,
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

// delete lotto set
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

// delete all lottos
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

exports.getCurrentLotto = async (req, res) => {
    try{
        const {id} = req.body
        if(!id){
            return res.send('need id in request!')
        }

        const userRole = req.user.role
        const allowRole = ['admin', 'seller']
        if(!userRole in allowRole){
            return res.send('you are not allow!')
        }

        const currentLotto = await Lotto.findById(id)
        if(!currentLotto){
            return res.status(404).send('lotto not found')
        }

        return res.status(200).send({
            message: 'found lotto',
            success: true,
            lotto: currentLotto
        })
    }
    catch(error){
        res.send('ERROR can not get current lotto data, please check console')
        console.log(error)
    }
}

exports.editCurrentLotto = async (req, res) => {
    try{
        const userId = req.user.id

        const {
            cost, // ต้นทุนหวย/ใบ
            price, // ราคาขายหวย/ใบ
            retail, // boolean
            wholesale, // boolean
            id

        } = req.body

        /* const seller = await Seller.findById(userId) */
        /* const shopname = seller.shop_name */

        // will run on admin site----------------------------

        /* const year = "25" + number[0][0] + number[0][1]
        const day = number[0][3] + number[0][4]
        
        const now = new Date()
        const monthIndex = now.getMonth()
        const months = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤษจิกายน", "ธันวาคม"
        ]

        const currentMonth = months[monthIndex]

        const period = `${day} ${currentMonth} ${year}` */

        //----------------------------------------------

        /* const amount = number.length */
    
        /* const unit = 
            (type==='หวยเล่ม' || type==='หวยก้อน') ? 'เล่ม' :
            (type==='หวยชุด') ? 'ชุด' :
            'หน่วย' */

        const market = 
            (retail===true && wholesale===false) ? "retail" :
            (retail===false && wholesale===true) ? "wholesale" :
            (retail===true && wholesale===true) ? "all" :
            "none"

        /* let number_stock = [] // โค้ดหวย
        
        let set_stock = [] // ชุดที่ */
        
        /* for(let i in number){
            let number_decoded = 
            (type==='หวยก้อน' || type==='หวยเล่ม') ? `${number[i].substring(0, 9) + 'xxxxxx' + number[i].substring(14+1)}`
            : number[0]
            number_stock.push(number_decoded)

            let set_decoded = number[i].substring(6, 7+1)
            set_stock.push(set_decoded)
        } */

        /* const book = `${number[0].substring(16,19) + number[0].substring(19)}` // เล่มที่
 */
        /* const set_string = set_stock.join(", ")

        const six_number = (type==='หวยเล่ม') ? `xxxx00-xxxx99`
        : (type==='หวยก้อน') ? `xxxx00-xxxx99 x${amount}`
        : number[0].substring(9, 14+1)

        const pcs =
            (type==='หวยเล่ม') ? 100 :
            (type==='หวยก้อน') ? amount*100 :
            amount */

        const newLotto = 
            {
                /* seller_id: userId,
                shopname: shopname,
                type: type, // ประเภทฉลาก (หวยเดี่ยว, หวยชุด, หวยก้อน, หวยกล่อง...)
                number: number_stock, // หมายเลขฉลาก xx-xx-xx-xxxxxx-xxxx
                six_number: six_number, // เลข 6 หลัก
                amount: amount, // จำนวนหวย (ชุด)
                period: period, // งวดที่ออก
                book: book, // เล่มที่
                set: set_stock, // ชุดที่ */
                cost: cost,
                price: price,
                profit: price-cost,
                market: market, // ตลาดที่หวยชุดนี้ลงขาย
                /* pcs: pcs // จำนวนหวย (ใบ) */
            }

        const lotto = await Lotto.findByIdAndUpdate(id, newLotto)

        if(lotto){
            res.send({
                message: `แก้ไขฉลากแล้ว`,
                /* data:lotto, */
                /* six_number: six_number,
                set: set_string,
                unit: unit, */
                success: true,
            })
        }
        else {
            res.send({
                message: 'ไม่สามารถแก้ไขฉลากได้',
                success: false
            })
        }
    }
    catch(error){
        console.log(error.message)
        res.status(500).send(error.message)
    }
}

exports.getTargetShop = async (req, res) => {
    try{
        const {id} = req.params
        const lotto = await Lotto.findById(id)
        if(!lotto){
            return res.send('lotto no found?')
        }
        const shop_lottos = await Lotto.find({seller_id:lotto.seller_id})
        if(!shop_lottos || shop_lottos.length===0){
            return res.send('ไม่พบสินค้าในระบบ')
        }

        const on_sell = shop_lottos.filter(item=>
            item.on_order===false
        )
         
        return res.send({
            message : `เข้าสู่ร้าน : ${lotto.shopname}`,
            amount: `มีสินค้าพร้อมขายในร้าน : ${on_sell.length}`,
            products : on_sell
        })

    }
    catch(err){
        res.send('ERROR can not get target lottos')
        console.log(err)
    }
}