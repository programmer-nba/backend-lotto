const Order = require('../models/Orders/Order.model.js')
const Lotto = require('../models/Products/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')
const User = require('../models/UsersModel/UsersModel.js')

// สร้างเลขบิล > หลังจ่ายเงินแล้ว
const genBill = async (id) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 as month is zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const numericDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;

    const result = `${id[0]}${id[1]}${id[2]}${numericDateTime}`
    return result
}

// สร้างเลขออร์เดอร์
const genOrderNo = async (id) => {
    const order = await Order.find()
    const code = `${order.length}`
    const id_code = `${id[0]}${id[2]}${id[4]}`
    const result = (code<10) ? `00${code}${id_code}` : (code>=10 && code<100) ? `0${code}${id_code}` : `${code}${id_code}`
    return result
}

// หมดเวลา 
const timeOut = async (order_id, seconds) => {

    setTimeout(async () => {
        const order = await Order.findById(order_id)
        for(i in order.lotto_id){
            const lotto = await Lotto.findById(order.lotto_id[i])
            if(lotto.on_order && order.status==='ยืนยัน'){
                await Lotto.findByIdAndUpdate(order.lotto_id[i], {on_order: false})
                console.log(`order cancle > lotto is backing to market`)
            } else {
                console.log(`--> lotto is (accepted or cancled)`)
            }
        }
    }, seconds*1000)

    setTimeout(async () => {
        const order = await Order.findById(order_id)
        if(order.status==='ยืนยัน'){
            await Order.findByIdAndUpdate(order_id, 
                {
                    $set: {
                        status:'หมดเวลา', 
                        detail:{
                            seller: 'ลูกค้าไม่ได้ชำระเงินภายในเวลาที่กำหนด',
                            buyer: 'ลูกค้าไม่ได้ชำระเงินภายในเวลาที่กำหนด'
                        }
                    },
                    $push: {
                        statusHis: {
                            name: 'หมดเวลา',
                            status: 'หมดเวลา',
                            timeAt: new Date()
                        }
                    }
                    
                }
            )
            console.log(`order time-out`)
        } else {
            console.log(`order confirm > order is on process...`)
        }
    }, seconds*1000)

} 

const cutStocks = async (lottos_id, buyer_id) => {
    const lottos_list = lottos_id.map( async (id)=>{
        const lotto = await Lotto.findById(id)
        lotto.buyer_id = buyer_id
        lotto.sold = true
        const seller = await Seller.findById(buyer_id)
        if(!seller){
            const user = await User.findById(buyer_id)
            lotto.buyer_name = user.name
        } else {
            lotto.buyer_name = seller.name
        }
        await lotto.save()
    })
    return Promise.all(lottos_list)
}

// admin get all orders
exports.getAllOrders = async (req, res) => {
    try{
        const userRole = req.user.role
        if(userRole!=='admin'){
           return res.send('you are not allowed!') 
        }
        
        const orders = await Order.find().populate('seller', 'name shop_name role seller_role').populate('buyer', 'name shop_name role seller_role')
        if(!orders || orders.length===0){
            return res.send(`มีออร์เดอร์ในระบบ ${orders.length} ออร์เดอร์`)
        }

        return res.send({
            message: `มีออร์เดอร์ในระบบ ${orders.length} ออร์เดอร์`,
            orders
        })
    }
    catch (err) {
        console.log(err.message)
        res.send('ERROR, con not get all orders')
    }
}

// for sellers
exports.getMyOrders = async (req, res) => {
    try{
        const myId = req.user.id
        const sellerRole = req.user.seller_role

        let myOrders = null
        if(sellerRole==='ขายปลีก'){
            myOrders = await Order.find({seller:myId}).populate('seller').lean()
            
            for (const item of myOrders) {
                const userAsBuyer = await User.findById(item.buyer.toString()).lean()
                item.buyer = userAsBuyer
            }

        } 

        myOrders = await Order.find({seller:myId}).populate('seller').lean()
    
        for (const item of myOrders) {
            const userAsBuyer = await User.findById(item.buyer.toString()).lean()
            if(userAsBuyer) {
                item.buyer = userAsBuyer
            } else {
                const retailAsBuyer = await Seller.findById(item.buyer.toString()).lean()
                if(retailAsBuyer) {
                    item.buyer = retailAsBuyer
                }
            }
            
        }
                
        if(!myOrders || myOrders.length===0){
            return res.send({
                message: 'ไม่มีออร์เดอร์ในตอนนี้',
                myOrders: [],
            })
        } 

        const myNewOrders = myOrders.filter(item=>item.status==='ใหม่')
        const myAcceptedOrders = myOrders.filter(item=>item.status==='ยืนยัน')
        
        return res.send({
            message: `ออร์เดอร์ใหม่= ${myNewOrders.length}, ออร์เดอร์ทั้งหมด= ${myOrders.length}, ออร์เดอร์ที่รับแล้ว= ${myAcceptedOrders.length}`,
            myOrders: myOrders,
        })
        
    }
    catch(error){
        res.send('ERROR con not get my orders')
        console.log(error.message)
    }
}

// admin delete all current orders and orders history
exports.deleteAllOrders = async (req, res) => {
    try{
        const userRole = req.user.role
        if(userRole!=='admin'){
            return res.send('you are not alloed!')
        }

        const deletedOrders = await Order.deleteMany()
        if(!deletedOrders){
            return res.send('can not delete!')
        }
        res.send('delete success!')
    }
    catch(err){
        res.send('ERROR can not delete all order history')
        console.log(err.message)
    }
}

// "ขายปลีก or user" get thire current order list  
exports.getMyPurchase = async (req, res) => {
    try{
        const myId = req.user.id
        const userRole = req.user.role

        let myPurchases = null
        let userAsBuyer = null
        if(userRole==='user'){
            myPurchases = await Order.find({buyer:myId}).populate('seller').lean()
            userAsBuyer = await User.findById(myId)
            myPurchases.forEach((item)=>{
                item.buyer = userAsBuyer
            })
        } else {
            myPurchases = await Order.find({buyer:myId}).populate('buyer').populate('seller')
        }

        if(!myPurchases || myPurchases.length===0){
            return res.send({
                message: 'ไม่มีออร์เดอร์',
                myOrders: [],
            })
        }

        const myNewPurchases = myPurchases.filter(item=>item.status==='ใหม่')
        const myAcceptedPurchase = myPurchases.filter(item=>item.status==='ยืนยัน')

        return res.send({
            message : `ออร์เดอร์ทั้งหมด = ${myPurchases.length}, ออร์เดอร์ใหม่ = ${myNewPurchases.length}, ออร์เดอร์ที่กำลังดำเนินการ = ${myAcceptedPurchase.length}`,
            myOrders: myPurchases,
            
        })
    }
    catch(err){
        res.send('ERROR! can not get purchase')
        console.log(err.message)
    }
}

/* // "ขายส่ง" เตรียมพร้อมแล้ว รอเช็คเงินโอนจาก ขายปลีก
exports.readyOrder = async (req, res) => {
    try{
        const {id} = req.params
        const ready_order = await Order.findOneAndUpdate(
            {_id:id, status:'ยืนยัน'}, 
            {$set:{status:'รอชำระเงิน',
            detail:{
                seller: 'รอชำระเงิน',
                buyer: 'รอชำระเงิน'
            }
        }}, 
            {new:true}
        )
        if(!ready_order){
            return res.send('order not found or already ready')
        }

        return res.send({
            message: `จัดเตรียมออร์เดอร์พร้อมแล้ว...รอลูกค้าชำระเงิน`,
        })
    }
    catch(error){
        res.send('ERROR! can not ready order')
        console.log(error)
    }
} */

// get target order
exports.getOrder = async (req, res) => {
    try{
        const {id} = req.params
        let order = await Order.findById(id).lean()
        if(!order){
            return res.send('order not found')
        }
        const seller = await Seller.findById(order.buyer)
        if(!seller){
            const user = await User.findById(order.buyer).lean()
            if(!user){
                return res.send('buyer not found')
            }
            order.buyer = user
        } else {
            order = await Order.findById(id).populate('buyer').populate('seller')
        }
        
        return res.send({
            message: 'get order success',
            order
        })
    }
    catch(error){
        res.send('ERROR, can not get order!')
        console.log(error)
    }
}

//----------------------------- order sequence ---------------------------------

// "ขายปลีก + user" create new order
exports.createOrder = async (req, res) => {
    try{
        const { lotto_id, transfer, msg, market, price_request, buyer_front } = req.body
        const buyer_id = req.user.id
        const buyer_name = req.user.name
    
        const lotto_list = lotto_id.map(async (id) => {
            const lotto = await Lotto.findById(id)
            return lotto
        })
        const lottos = await Promise.all(lotto_list)

        const lotto = await Lotto.findById(lotto_id[0])
        if(!lotto){
            return res.send('lotto id not found')
        }

        const retail_lottos_price = Promise.all(
            lottos.map((lotto)=>{
                const price = lotto.prices.retail.total
                return Promise.resolve(price)
            })
        )
        const resolved_retail_prices = await retail_lottos_price
        const total_retail_prices = resolved_retail_prices.reduce((a, b) => a + b, 0)

        const wholesale_lottos_price = Promise.all(
            lottos.map((lotto)=>{
                const price = lotto.prices.wholesale.total
                return Promise.resolve(price)
            })
        )
        const resolved_wholesale_prices = await wholesale_lottos_price
        const total_wholesale_prices = resolved_wholesale_prices.reduce((a, b) => a + b, 0)

        const seller_id = lotto.seller_id 

        let buyer = await Seller.findById(buyer_id)
        if(!buyer){
            buyer = await User.findById(buyer_id)
            if(!buyer) {
                return res.send('ไม่พบ buyer นี้')
            }
        }

        let myAddress = {...buyer.address, tel: buyer.phone_number, name: buyer.name}

        const transferBy = (transfer==='address') ? myAddress : transfer  

        const order_no = await genOrderNo(lotto_id[0])

        const amount = lottos.map((item)=>{
            return item.pcs
        })

        const sum_amount = amount.reduce((a, b)=> a + b, 0)

        const each_lotto = 80
        const all_lottos = 80*sum_amount // ราคาหวยรวมทุกใบ = 80*amount
        const transfer_cost = 
            (transfer==='รับเอง') ? 0 
            : (transfer==='ฝากตรวจ') ? 0 
            : 50

        const retail_service = total_retail_prices - all_lottos // ค่าบริการจัดหาฉลาก 
        const wholesale_service = total_wholesale_prices - all_lottos // ค่าบริการจัดหาฉลาก

        const new_order = {
            lotto_id: lottos,
            buyer: buyer_id || seller_id,
            seller: seller_id,
            status: 'ใหม่',
            detail: {
                buyer: buyer_front,
                msg: msg,
                market: market
            },

            order_no: order_no,
            transferBy: transferBy,

            price: {
                each_lotto: each_lotto, // ราคาหวยแต่ละใบ 80.-
                all_lottos: all_lottos, // ราคาหวยรวมทุกใบ = 80*amount
                retail_service: retail_service, // ค่าบริการจัดหาฉลาก = total - all_lottos
                wholesale_service: wholesale_service,
                transfer: transfer_cost, // ค่าส่ง
                total_retail: total_retail_prices, // ราคารวมทั้งหมด
                total_wholesale: total_wholesale_prices, // ราคารวมทั้งหมด
                discount: {
                    text: 'ไม่มีส่วนลด',
                    amount: 0
                }
            },

            price_request: (price_request) ? {
                amount: price_request?.amount || null,
                msg: price_request?.msg || null
            } : null,

            statusHis: {
                name: buyer_name,
                status: 'ใหม่',
                timeAt: new Date() 
            },

        }
        
        const order = await Order.create(new_order)
        if(!order){
            return res.send('order not created')
        }
        
        /* for(i in lotto_id){
            await Lotto.findByIdAndUpdate(lotto_id[i], {on_order: true})
            .then(()=>console.log('updated lotto status'))
            .catch(()=>res.send('lotto not found'))
        } */

        await Lotto.updateMany(
            { _id: { $in: lotto_id } },
            { $set: { on_order: true } }
        )
        .then(()=>console.log('updated lotto status'))
        .catch(()=>res.send('lotto not found'))

        return res.send({
            message: `สร้างออร์เดอร์สำเร็จ มีสินค้าทั้งหมด ${order.lotto_id.length} ชิ้น`,
            order_id: order._id,
            order_transfer: order.transferBy,
            buyer_id: order.buyer,
            buyer_name: buyer_name,
            seller_name: lotto.shopname,
            seller_id: seller_id,
            order_start: order.createdAt,
            lottos_price: order.price,
            request: order.price_request
        })
        
    }
    catch(err){
        res.send(`Error creating order: ${err.message}`)
        console.log(err.message)
    }
}

exports.addDiscount = async (req,res) => {
    const { id } = req.params
    const { discount_text, discount_amount } = req.body
    const userName = req.user.name
    try {
        const order = await Order.findByIdAndUpdate(id,
            {
                $set: {
                    'price.discount.text': discount_text,
                    'price.discount.amount': discount_amount
                },
                $push: {
                    statusHis: {
                        name: userName,
                        status: 'เพิ่มส่วนลด',
                        timeAt: new Date() 
                    },
                }
            },
            {
                new :true
            }
        )
        if(!order){
            return res.send({
                message: 'ไม่พบ id order นี้',
                order : order
            })
        }

        return res.send({
            message: 'ลดราคาสำเร็จ',
            order: order
        })
    }
    catch(err){
        console.log(err)
        return res.send({
            message: err.message
        })
    }
}

exports.addDiscountByItem = async (req, res) => {
    const { id } = req.params
    const { lotto_list } = req.body
    try {
        let order = await Order.findById( id )
        if(!order){
            return res.send({
                message: 'ไม่พบออร์เดอร์นี้',
                order: order
            })
        }

    }
    catch (err) {
        console.log(err)
        return res.send({
            message: err.message
        })
    }
}

// seller cancle a current new order or reject payment
exports.cancleOrder = async (req, res) => {
    try{
        const {id} = req.params
        const userName = req.user.name
        const {cancled_reason} = req.body
        const me = userName

        const order = await Order.findById(id)
        if(!order){
            return res.send('ไม่พบออร์เดอร์นี้')
        }

        if(order.status==='ใหม่'){
            order.status = 'ยกเลิก'
            order.detail.seller = `ถูกยกเลิกโดย ${me} เนื่องจาก ${cancled_reason}`
            order.detail.buyer = `ถูกยกเลิกโดย ${me} เนื่องจาก ${cancled_reason}`
            order.statusHis.push({
                name: userName, 
                status: 'ยกเลิก',
                timeAt: new Date()
            })

            await order.save()

            const lottos_list = order.lotto_id.map( async (item)=>{
                const lotto = await Lotto.findById(item)
                lotto.on_order = false
                lotto.save()
            })
            Promise.all(lottos_list)
                .then(()=>console.log('Success, set all lottos on_order = false '))
                .catch(()=>console.log('ERROR, can not change lottos on_order to false'))
        }
        
        else if(order.status==='ตรวจสอบยอด'){
            order.status = 'ปฏิเสธ',
            order.detail.seller = `ร้านค้าปฏิเสธการรับยอด เนื่องจาก ${cancled_reason}`
            order.detail.buyer = `ร้านค้าปฏิเสธการรับยอด เนื่องจาก ${cancled_reason}`
            order.statusHis.push({
                name: userName,
                status: 'ปฏิเสธ',
                timeAt: new Date()
            })

            await order.save()
        }

        else {
            return res.send('ออร์เดอร์นี้ถูกยกเลิก หรือ ถูกปฏิเสธการชำระเงิน ไปแล้วนะจ๊ะ')
        }
        
        return res.send({
            message: `ออร์เดอร์ถูกยกเลิก หรือ ถูกปฏิเสธการชำระเงิน`,
            reason: order.detail.seller || order.detail.buyer,
            order: order
        })
    }
    catch(err){
        console.log(err.message)
        res.send('ERROR can not cancle order')
    }
}

// "seller" accepted an new order to processing
exports.acceptOrder = async (req, res) => {
    try {
        const {id} = req.params
        const userName = req.user.name

        const prev_info = await Order.findById(id)

        const accept_order = await Order.findOneAndUpdate(
            {_id:id, status:'ใหม่'}, 
            {
                $set:{
                    status:'ยืนยัน', 
                },
                $push:{
                    statusHis:{
                        name: userName,
                        status: 'ยืนยัน', 
                        timeAt: new Date()
                    },
                }
            }, 
            {new:true}
        )
        if(!accept_order){
            return res.send('order not found or already accepted')
        }

        timeOut(id, 15000)
        
        return res.send({
            message: `ร้านค้ารับออร์เดอร์แล้ว...กำลังจัดเตรียมฉลาก`,
            order: accept_order
        })

    }
    catch(err){
        res.send(`ERROR! can not accept order: ${err.message}`)
        console.log(err.message)
    }
}

// "ขายปลีก" จ่ายเงินและแนบสลิป
exports.payment = async (req, res) => {
    try{
        const dataIds = req.dataIds
        const userName = req.user.name
        const {id} = req.params

        const slip_img = (dataIds && dataIds.some(id => id.includes('slip_img/'))) 
            ? dataIds.filter(id => id.includes('slip_img/'))[0].replace('slip_img/', '')
            : null
            const slip_img_link = (slip_img) 
                ? `https://drive.google.com/file/d/${slip_img}/view` 
                : `none`

        const order = await Order.findByIdAndUpdate({_id:id, status:{$in:['ยืนยัน','ปฏิเสธ']}}, 
        {
            $set:{
                paid_slip:slip_img_link,
                status: 'ตรวจสอบยอด',
            },
            $push:{
                statusHis:{
                    name: userName,
                    status: 'ตรวจสอบยอด', 
                    timeAt: new Date()
                },
            }
        })
        if(!order){
            return res.send('not found order id?')
        }

        return res.send({
            message: 'upload slip picture success',
            order_no: order.order_no,
            slip : slip_img_link
        })
    }
    catch(error){
        res.send('ERROR! can not payment this order')
        console.log(error)
    }
}

// "admin" รับยอดโอน
exports.receipt = async (req, res) => {
    try{
        const {id} = req.params
        const userName = req.user.name
        const bill_no = await genBill(id)
        const order = await Order.findByIdAndUpdate(
            {_id:id, status:'ตรวจสอบยอด'}, 
            {
                $set:{
                    status:'ชำระแล้ว', 
                    bill_no:bill_no
                },
                $push:{
                    statusHis:{
                        name: userName || req.user.username,
                        status: 'ชำระแล้ว', 
                        timeAt: new Date()
                    },
                }
            }
        )
        if(!order){
            return res.send('order not found')
        }

        const cutStock = await cutStocks(order.lotto_id, order.buyer)
        if(!cutStock){
            return res.send('can not cut stock')
        }

        return res.send({
            message: 'แอดมินรับยอดเรียบร้อย...รอลูกค้ายืนยันรับของ',
            bill_no: order.bill_no
        })
    }
    catch(error){
        res.send('can not send receipt!')
        console.log(error.message)
    }
}

// "ขายปลีก" รับของเรียบร้อย 
exports.doneOrder = async (req, res) => {
    try{
        const { id } = req.params
        const userName = req.user.name

        const order = await Order.findByIdAndUpdate({_id:id, status:'ชำระแล้ว'}, 
        {
            $set:{
                status:'สำเร็จ'
            },
            $push:{
                statusHis:{
                    name: userName,
                    status: 'สำเร็จ', 
                    timeAt: new Date()
                },
            }
        })
        if(!order){
            return res.send('order not found')
        }

        return res.send({
            message: 'ออร์เดอร์สำเร็จ รับของแล้ว',
            order
        })
    }
    catch(error){
        res.send('ERROR, can not done-order!')
        console.log(error)
    }
}

// Bill
exports.orderReceipt = async (req, res) => {
    const { id } = req.params

    try {

        let order = null
        const thisOrder = await Order.findById(id)
        if(!thisOrder){
            return res.send('order not found')
        }

        const userAsBuyer = await User.findById(thisOrder.buyer.toString()).lean()
        if(userAsBuyer){
            order = await Order.findById(id).populate('seller').lean()
            order.buyer = userAsBuyer 
            if( !order ) {
                return res.send('order not found')
            }
            if( !['สำเร็จ','ชำระแล้ว'].includes(order.status) ) {
                return res.send('ออร์เดอร์นี้ยังไม่ผ่านการตรวจสอบการชำระเงิน')
            }
        } else {
            order = await Order.findById(id).populate('seller').populate('buyer')
            if( !order ) {
                return res.send('order not found')
            }
            if( !['สำเร็จ','ชำระแล้ว'].includes(order.status) ) {
                return res.send('ออร์เดอร์นี้ยังไม่ผ่านการตรวจสอบการชำระเงิน')
            }
        }
        
        const lotto_list = order.lotto_id.map(item=>{
            const lotto = {
                text: `${item.type} เลข${item.decoded[0].six_number} งวดที่ ${item.date} จำนวน ${item.amount} ${item.unit}`,
                type: item.type, // ประเภทฉลาก
                date: item.date, // งวดที่ออก
                amount: item.amount, // จำนวน ชุด,เล่ม
                pcs: item.pcs, // จำนวนหวย ใบ
                number: item.decoded[0].six_number, // เลขหกหลัก
                price: item.price // ราคารวม
            }
            return lotto
        })

        const receipt = {
            shop: {
                name: order.seller.shop_name, // ชื่อร้านค้า
                address: order.seller.shop_location || order.seller.address, // ที่อยู่ร้านค้า
                tel: order.seller.shop_number || order.seller.phone_number, // เบอร์โทรร้านค้า
                taxId: order.seller.personal_id, // เลขประจำตัวผู้เสียภาษีของร้านค้า
                logo: order.seller.shop_img // โลโก้ร้าน
            },
            buyer: {
                name: order.buyer.name, // ชื่อผู้รับสินค้า
                address: order.transferBy, // ที่อยู่จัดส่งสินค้า
                tel: order.buyer.phone_number || order.buyer.phone_number, // เบอร์โทรผู้ซื้อ
                taxId: order.buyer.personal_id, // เลขประจำตัวผู้เสียภาษีของผู้ซื้อ
            },
            lotto: lotto_list, // รายละเอียดฉลากที่ซื้อแต่ละรายการ
            order: {
                amount: order.lotto_id.length, // จำนวนรายการชุดฉลากที่ซื้อ
                bill_no: order.bill_no, // เลขที่ใบเสร็จ
                order_no: order.order_no, // หมายเลขออร์เดอร์
                price: order.price // ราคารวมสุทธิ
            },
            date: order.createdAt // วันที่สั่งออร์เดอร์
        }

        return res.send(receipt)
    }
    catch(error){
        res.send('ERROR, can not order-bill!')
        console.log(error)
    }
}


