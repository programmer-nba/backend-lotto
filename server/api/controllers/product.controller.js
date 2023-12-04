// import database
const Lotto = require('../models/Products/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')

// get my all lotteries data
exports.getMyLottos = async (req, res) => {
    try{
        const userId = req.user.id
        const myLottos = await Lotto.find(
            {
                $or: [
                    {seller_id: userId},
                    {buyer_id: userId},
                ]
            }
        ).populate('seller_id', 'shop_img', 'shop_cover')

        if(!myLottos || myLottos.length===0){
            return res.send('ไม่มีหวยในคลังของฉัน')
        }

        return res.send({
            count: `หวยของฉันมีทั้งหมด ${myLottos.length} ชุด`,
            myLottos
        })
    }
    catch(err){
        console.log(err.message)
        res.send({message:"ERROR : please check console"})
    }
}

// create new lotto set
exports.addLottos = async (req, res)=>{
    console.log(req.config)
    try{
        const userId = req.user.id
        const sellerRole = req.user.seller_role
        const date = req.config.period
        
        let {
            code, // เลข barcode
            type, // ประเภทหวย
            cost, // ต้นทุนหวย/ใบ
            price, // ราคาขายหวย/ใบ
            wholesale_price,
            retail_price,
            retail, // boolean
            wholesale, // boolean
            amount // จำนวนชุด, ใบ
        } = req.body

        const seller = await Seller.findById(userId)
        const shopname = seller.shop_name
    
        const unit = 
            (type==='หวยเล่ม' || type==='หวยก้อน') ? 'เล่ม' :
            (type==='หวยชุด') ? 'ชุด' :
            'หน่วย'

        // avoid wholesale from reatil role
        if(sellerRole==='ขายปลีก'){
            wholesale = false
        } else {
            wholesale = wholesale
        }

        const market = 
            (retail===true && wholesale===false) ? "retail" :
            (retail===false && wholesale===true) ? "wholesale" :
            (retail===true && wholesale===true) ? "all" :
            "none"
        
        const pcs =
            (type==='หวยเล่ม') ? 100 :
            (type==='หวยก้อน') ? amount*100 :
            amount

        for(i of code) {
    
            const decoded_list = i.split('-') // 0 1 2 3 4
            const decoded = {
                year: decoded_list[0],
                period: decoded_list[1],
                set: decoded_list[2],
                six_number: decoded_list[3],
                book: decoded_list[4],
            }
                
            const newLotto = 
                {
                    seller_id: userId,
                    shopname: shopname,
                    date: date,
                    type: type, // ประเภทฉลาก (หวยเดี่ยว, หวยชุด, หวยก้อน, หวยกล่อง...)
                    code: i, // เลข barcode
                    decoded : decoded,
                    unit: unit, // หน่วย
                    amount: amount, // จำนวนหวย (ชุด)
                    cost: cost, // ต้นทุน
                    price: price, // ราคาขาย > ตลาดขายส่ง
                    prices: {
                        wholesale: {
                            total: wholesale_price, // ราคารวมทั้งหมด
                            service: wholesale_price - (80*amount)
                        },
                        retail: {
                            total: retail_price,
                            service: retail_price - (80*amount)
                        },
                    },
                    profit: price-cost, // กำไร
                    market: market, // ตลาดที่หวยชุดนี้ลงขาย
                    pcs: pcs, // จำนวนหวย (ใบ)
                    on_order: false, // 
                    text: `${type} จำนวน ${amount} ${unit}`
                }

            const lotto = await Lotto.create(newLotto)
            if(!lotto){
                return res.send({
                    message: 'ไม่สามารถเพิ่มฉลากได้',
                    success: false
                })
            }

        }
        
        return res.send({
            message: `เพิ่มฉลากแล้ว : ${type} จำนวน ${code.length} ${unit} ลงขายในตลาด ${market}`,
            success: true,
        })

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
            return res.send({message:"ไม่พบสินค้าในระบบ", success:false})
        } 

        const result = await Lotto.deleteMany({seller_id: userId})
        
        if(!result){
            return res.send({message:"ไม่สามารถลบสินค้าได้", success:false})
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
        const allowRole = ['admin', 'seller', 'user']
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
        const sellerRole = req.user.seller_role

        let {
            cost, // ต้นทุนหวย/ใบ
            price, // ราคาขายหวย/ใบ
            retail, // boolean
            wholesale, // boolean
            id
        } = req.body

        if(sellerRole==='ขายปลีก'){
            wholesale = false
        } else {
            wholesale = wholesale
        }

        const market = 
            (retail===true && wholesale===false) ? "retail" :
            (retail===false && wholesale===true) ? "wholesale" :
            (retail===true && wholesale===true) ? "all" :
            "none"

        const newLotto = 
            {
                cost: cost,
                price: price,
                profit: price-cost,
                market: market,
            }

        const lotto = await Lotto.findByIdAndUpdate(id, newLotto, {new:true})

        if(lotto){
            return res.send({
                message: `แก้ไขฉลากแล้ว`,
                success: true,
                lotto,
            })
        } else {
            return res.send({
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
        const {id} = req.params // id of lotto
        const role = req.user.seller_role
        const lotto = await Lotto.findById(id).populate('seller_id')
        if(!lotto){
            return res.send('lotto no found?')
        }
        const shop_lottos = await Lotto.find({seller_id:lotto.seller_id._id})
        if(!shop_lottos || shop_lottos.length===0){
            return res.send('ไม่พบสินค้าในระบบ')
        }

        let on_sell = null
        if(role==='ขายปลีก'){
            on_sell = shop_lottos.filter(item=>
                item.on_order===false && ['wholesale', 'all'].includes(item.market)
            )
        } else if (role==='user') {
            on_sell = shop_lottos.filter(item=>
                item.on_order===false && ['retail', 'all'].includes(item.market)
            )
        } else {
            on_sell = shop_lottos.filter(item=>
                item.on_order===false 
            )
        }
        
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