// import database
const Lotto = require('../models/Products/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')
const Order = require('../models/Orders/Order.model.js')
const Discount = require('../models/Products/discount.model.js')

// get my all lotteries data
exports.getMyLottos = async (req, res) => {
    try{
        const userId = req.user.id
        const myLottos = await Lotto.find(
            {
                $or: [
                    {seller_id: userId},
                    //{buyer_id: userId},
                ],
                
            }
        ).populate('seller_id', 'shop_img, shop_cover')

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
    
    try{
        const userId = req.user.id
        const sellerRole = req.user.seller_role
        const date = req.config.period
        
        let {
            code, // เลข barcode
            type, // ประเภทหวย
            cost, // ต้นทุนหวย/ใบ
            price,
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
            retail_price = price
            
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

        let prices = 
         (market === "retail") ? retail_price || price :
         (market === "wholesale") ? wholesale_price : retail_price

        let newLottos = []

        for(i of code) {
            /* console.log(i)

            const existCode = await Lotto.find({
                code: {
                    $in: [i]
                }
            })
            if(existCode.length>0){
                return res.send({
                    message: `มีสลากรหัสนี้ในระบบแล้ว ${i}`,
                    code: `${i}`
                })
            } */
    
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
                    price: prices, // ราคาขาย > ตลาดขายส่ง
                    prices: {
                        wholesale: {
                            total: wholesale_price || null, // ราคารวมทั้งหมด
                            service: wholesale_price - (80*pcs) || null
                        },
                        retail: {
                            total: retail_price || null,
                            service: retail_price - (80*pcs) || null
                        },
                    },
                    profit: prices-cost, // กำไร
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

            newLottos.push(lotto)

        }
        
        return res.send({
            message: `เพิ่มฉลากแล้ว : ${type} จำนวน ${code.length} ${unit} ลงขายในตลาด ${market}`,
            success: true,
            lotto: newLottos
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
            price,
            wholesale_price, // ราคาขายหวย/ใบ
            retail_price, // ราคาขายหวย/ใบ
            retail, // boolean
            wholesale, // boolean
            id
        } = req.body

        if(sellerRole==='ขายปลีก'){
            wholesale = false
            retail_price = price
            wholesale_price = null
        } else {
            wholesale = wholesale
        }

        const market = 
            (retail===true && wholesale===false) ? "retail" :
            (retail===false && wholesale===true) ? "wholesale" :
            (retail===true && wholesale===true) ? "all" :
            "none"

        let prices = 
        (market === "retail") ? retail_price:
        (market === "wholesale") ? wholesale_price : retail_price

        let oldlotto = await Lotto.findById(id)
        const pcs = oldlotto.pcs
        console.log(pcs)

        const lotto = await Lotto.findByIdAndUpdate(id, {
            $set : {
                cost: cost,
                price: prices,
                'prices.wholesale.total': wholesale_price,
                'prices.wholesale.service': (!wholesale_price) ? null : wholesale_price-(80*pcs),
                'prices.retail.total': retail_price,
                'prices.retail.service': (!retail_price) ? null : retail_price-(80*pcs),
                profit: prices-cost,
                market: market
            }
        }, {new:true})

        

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
        const shop_lottos = await Lotto.find({seller_id:lotto.seller_id._id}).populate('seller_id', 'name shopname shop_img shop_cover shop_number phone_number')
        if(!shop_lottos || shop_lottos.length===0){
            return res.send('ไม่พบสินค้าในระบบ')
        }

        let on_sell = null
        if(role==='ขายปลีก'){
            on_sell = shop_lottos.filter(item=>
                item.on_order===false && ['wholesale', 'all'].includes(item.market) && item.sold!==true && item.cut_stock!==true
            )
        } else if (role==='user') {
            on_sell = shop_lottos.filter(item=>
                item.on_order===false && ['retail', 'all'].includes(item.market) && item.sold!==true && item.cut_stock!==true
            )
        } else {
            on_sell = shop_lottos.filter(item=>
                item.on_order===false && item.sold!==true && item.cut_stock!==true
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

exports.cutStocks = async (req, res) => {
    const sellerId = req.user.id
    const {lottos_code, text='-'} = req.body 
    try {
        const lottos = await Lotto.find(
            {
                code: {
                    $elemMatch: {
                        $in: lottos_code
                    }
                },
                cut_stock: false,
                on_order: true,
                sold_:true,
                seller_id: sellerId
            }
        )

        if(!lottos || lottos.length===0) {
            return res.send({
                message: 'ไม่พบหวย',
                lottos: []
            })
        }

        const cutStock_lottos = lottos.map( async (lotto) => {
            const prev_info = await Order.find({
                lotto_id:{$in:lotto._id}
                })
                .populate('buyer', 'role')
                console.log(prev_info)
            let sold_price = 
                (prev_info.buyer.role==='seller') ? prev_info.price.total_wholesale
                : prev_info.price.total_retail
                
            const cutStock_lotto = await Lotto.findByIdAndUpdate(lotto._id,
                {
                    $set: {
                        cut_stock: true,
                        sold: true,
                        sold_data: {
                            channel: 'ออนไลน์',
                            descript: text,
                            price: sold_price
                        }
                    }
                },
                {new: true}
            )
            if(!cutStock_lotto) {
                return 'ไม่พบ'
            }

            return cutStock_lotto
        })

        const stockCutted = await Promise.all(cutStock_lottos)

        return res.send(stockCutted)
    }
    catch (err) {
        console.log('ERROR can not cut stock', err.message)
        res.send(err.message)
    }
}

exports.cutStocksFront = async (req, res) => {
    const sellerId = req.user.id
    const {lottos_code, text='-', price} = req.body 
    try {
        const lottos = await Lotto.find(
            {
                code: {
                    $elemMatch: {
                        $in: lottos_code
                    }
                },
                cut_stock: false,
                seller_id: sellerId
            }
        )

        if(!lottos || lottos.length===0) {
            return res.send({
                message: 'ไม่พบหวย',
                lottos: []
            })
        }

        const cutStock_lottos = lottos.map( async (lotto) => {
            const prev_info = await Order.find({
                lotto_id:{$in:lotto._id}
                })
                .populate('buyer', 'role')
                console.log(prev_info)
            let sold_price = price
                
            const cutStock_lotto = await Lotto.findByIdAndUpdate(lotto._id,
                {
                    $set: {
                        cut_stock: true,
                        sold: true,
                        sold_data: {
                            channel: 'หน้าร้าน',
                            descript: text,
                            price: sold_price
                        }
                    }
                },
                {new: true}
            )
            if(!cutStock_lotto) {
                return 'ไม่พบ'
            }

            return cutStock_lotto
        })

        const stockCutted = await Promise.all(cutStock_lottos)

        return res.send(stockCutted)
    }
    catch (err) {
        console.log('ERROR can not cut stock', err.message)
        res.send(err.message)
    }
}

exports.getCuttedStokLottos = async (req, res) => {
    const sellerId = req.user.id
    try {
        const cutted_lottos = await Lotto.find(
            {
                seller_id: sellerId,
                cut_stock: true
            }
        )
        if(!cutted_lottos || cutted_lottos.length===0) {
            return res.send(
                {
                    message: 'ไม่พบหวย',
                    lottos: []
                }
            )
        }

        const lottos = cutted_lottos.map(async item => {
            try {
                let discount = 0
                const discountData = await Discount.findOne({ lotto: item._id })
                if(discountData){
                    discount = discountData.amount
                } else {
                    discount = 0
                }
                const lottoData = item.toObject({ virtuals: true })
    
                const lotto = {...lottoData, discount:discount}
    
                return lotto
            }
            catch(err){
                return res.send({
                    message: 'can not promise all'
                })
            }
        })
        console.log(lottos)
        const ok_lottos = await Promise.all(lottos)
        if(!ok_lottos){
            return res.send({
                message: 'can not promise all'
            })
        }
        

        return res.send({
            message: `หวยที่ตัดสต๊อกแล้ว ${lottos.length} ชุด`,
            lottos: ok_lottos
        })
    }
    catch (err) {
        res.send('ERROR!')
        console.log(err.message)
    }
}


//----------------------//
//       Discount       //
//-------↓ ↓ ↓ ↓ -------//

// create new discount (POST)
exports.addDiscount = async ( req, res ) => {
    const { id } = req.params
    const { amount, code } = req.body
    try {
        const order = await Order.findOne({
            lotto_id: {
                $in: [id]
            }
        })
        const new_discount = new Discount({
            code: code,
            lotto: id,
            amount: (code==='order' && order) ? amount/order.lotto_id.length : amount
        })
        const saved_discount = await new_discount.save()
        if(!saved_discount) {
            return res.send({
                message: 'can not save discount!',
                discount: saved_discount
            })
        }

        return res.send({
            message: 'create discount SUCCESS!',
            success: true,
            discount: saved_discount
        })
    }
    catch (err) {
        res.status(500).send({
            message: 'add Discount error!',
            err: err.message
        })
        console.log(err)
    }
}

// edit discount (PUT)
exports.editDiscount = async ( req, res ) => {
    const { id } = req.params
    const { amount } = req.body
    try {

        const edited_discount = await Discount.findByIdAndUpdate(id,
            {
                amount: amount
            },
            {
                new: true
            }
        )
        if(!edited_discount) {
            return res.send({
                message: 'can not edit discount!',
                discount: edited_discount
            })
        }

        return res.send({
            message: 'edit discount SUCCESS!',
            success: true,
            discount: edited_discount
        })
    }
    catch (err) {
        res.status(500).send({
            message: 'edit Discount error!',
            err: err.message
        })
        console.log(err)
    }
}

// delete discount (DELETE)
exports.deleteDiscount = async ( req, res ) => {
    const { id } = req.params
    try {

        const deleted_discount = await Discount.findByIdAndDelete(id)
        if(!deleted_discount) {
            return res.send({
                message: 'can not delete discount!',
                discount: deleted_discount
            })
        }

        return res.send({
            message: 'delete discount SUCCESS!',
            success: true
        })
    }
    catch (err) {
        res.status(500).send({
            message: 'delete Discount error!',
            err: err.message
        })
        console.log(err)
    }
}

// get all discounts (GET)
exports.getDiscounts = async ( req, res ) => {
    try {

        const discounts = await Discount.find()
        if(!discounts || discounts.length===0) {
            return res.send({
                message: 'no any discount !',
                discount: discounts || []
            })
        }

        return res.send({
            message: `Have discounts ${discounts.length}`,
            success: true,
            discounts: discounts
        })
    }
    catch (err) {
        res.status(500).send({
            message: 'get all Discounts error!',
            err: err.message
        })
        console.log(err)
    }
}

// get a discount (GET)
exports.getDiscount = async ( req, res ) => {
    const { id } = req.params
    try {

        const discount = await Discount.findById(id)
        if(!discount) {
            return res.send({
                message: 'this discount not found !',
                discount: discount
            })
        }

        return res.send({
            discount: discount,
            success: true
        })
    }
    catch (err) {
        res.status(500).send({
            message: 'get Discount error!',
            err: err.message
        })
        console.log(err)
    }
}

