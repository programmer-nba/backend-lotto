const Order = require('../models/Orders/Order.model.js')
const Lotto = require('../models/Products/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js');

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
            if(lotto.on_order && order.status==='ใหม่'){
                await Lotto.findByIdAndUpdate(order.lotto_id[i], {on_order: false})
                console.log(`order cancle > lotto is backing to market`)
            } else {
                console.log(`--> lotto is (accepted or cancled)`)
            }
        }
    }, seconds*1000)

    setTimeout(async () => {
        const order = await Order.findById(order_id)
        if(order.status==='ใหม่'){
            await Order.findByIdAndUpdate(order_id, {status:'หมดเวลา', detail:{
                seller: 'ร้านค้าไม่ได้ยืนยันออร์เดอร์ภายในเวลาที่กำหนด',
                buyer: 'ร้านค้าไม่ได้ยืนยันออร์เดอร์ภายในเวลาที่กำหนด'
            }})
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
        const buyer = await Seller.findById(buyer_id)
        lotto.buyer_name = buyer.name
        await lotto.save()
    })
    return Promise.all(lottos_list)
}

// "ขายปลีก" create new order
exports.createOrder = async (req, res) => {
    try{
        const {lotto_id, transfer} = req.body
        const buyer_id = req.user.id
        const buyer_role = req.user.seller_role
        const buyer_name = req.user.name
        
        if(buyer_role!=='ขายปลีก'){
            return res.send('you are not allowed')
        }

        const lotto_list = lotto_id.map(async (id) => {
            const lotto = await Lotto.findById(id)
            return lotto
        })

        const lottos = await Promise.all(lotto_list)

        const lotto = await Lotto.findById(lotto_id[0])
        if(!lotto){
            return res.send('lotto id not found')
        }

        const lottos_price = Promise.all(
            lottos.map((lotto)=>{
                const price = lotto.price
                return Promise.resolve(price)
            })
        )
        const resolved_prices = await lottos_price
        const total_prices = resolved_prices.reduce((a, b) => a + b, 0)

        const seller_id = lotto.seller_id 

        const buyer = await Seller.findById(buyer_id)
        if(!buyer){
            buyer = 'ไม่พบ buyer นี้'
        }

        const transferBy = (transfer==='address') ? buyer.address : transfer  

        const order_no = await genOrderNo(lotto_id[0])

        const seller_text = 'คุณมีออร์เดอร์ใหม่'
        const buyer_text = 'กรุณารอร้านค้ายืนยัน'

        const amount = lottos.map((item)=>{
            return item.amount
        })

        const sum_amount = amount.reduce((a, b)=> a + b, 0)

        const each_lotto = 80
        const all_lottos = 80*sum_amount // ราคาหวยรวมทุกใบ = 80*amount
        const transfer_cost = 0 // ค่าส่ง
        const service = total_prices - transfer_cost - all_lottos // ค่าบริการจัดหาฉลาก = total - transfer - all_lottos

        const new_order = {
            lotto_id: lottos,
            buyer: buyer_id,
            seller: seller_id,
            status: 'ใหม่',
            detail: {
                seller: seller_text,
                buyer: buyer_text
            },

            order_no: order_no,
            transferBy: transferBy,
            /* transfer_cost: 0,
            lottos_price: total_prices, */

            price: {
                each_lotto: each_lotto, // ราคาหวยแต่ละใบ 80.-
                all_lottos: all_lottos, // ราคาหวยรวมทุกใบ = 80*amount
                service: service, // ค่าบริการจัดหาฉลาก = total - transfer - all_lottos
                transfer: transfer_cost, // ค่าส่ง
                total: total_prices // ราคารวมทั้งหมด
            },
            
        }
        
        const order = await Order.create(new_order)
        if(!order){
            return res.send('order not created')
        }
        
        for(i in lotto_id){
            await Lotto.findByIdAndUpdate(lotto_id[i], {on_order: true})
            .then(()=>console.log('updated lotto status'))
            .catch(()=>res.send('lotto not found'))
        }
        
        const timeBeforeDelete = 30 // วินาที
        await timeOut(order._id , timeBeforeDelete)

        return res.send({
            message: `สร้างออร์เดอร์สำเร็จ มีสินค้าทั้งหมด ${order.lotto_id.length} ชิ้น`,
            order_id: order._id,
            order_transfer: order.transferBy,
            buyer_name: buyer_name,
            seller_name: lotto.shopname,
            seller_id: seller_id,
            order_start: order.createdAt,
            transfer_cost: order.price.transfer,
            lottos_price: total_prices,
            status: `กำลังรอร้านค้ายืนยัน...ภายใน ${timeBeforeDelete/60} นาที`,
        })
        
    }
    catch(err){
        res.send(`Error creating order: ${err.message}`)
        console.log(err.message)
    }
}

// admin get all orders
exports.getAllOrders = async (req, res) => {
    try{
        const userRole = req.user.role
        if(userRole!=='admin'){
           return res.send('you are not allowed!') 
        }
        
        const orders = await Order.find()
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

// for "ขายส่ง" seller
exports.getMyOrders = async (req, res) => {
    try{
        const myId = req.user.id
        const orders = await Order.find().populate('buyer').populate('seller')
        if(!orders || orders.length===0){
            return res.send('orders no found')
        }

        const myOrders = orders.filter(item=>item.seller._id.toString()===myId)
        
        if(!myOrders || myOrders.length===0){
            return res.send('ไม่พบออร์เดอร์ของฉัน')
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

// seller cancle a current new order or reject payment
exports.cancleOrder = async (req, res) => {
    try{
        const {id} = req.params
        const {cancled_reason} = req.body
        const me = 
            (req.user.seller_role==='ขายส่ง') ? 'ร้านค้า' :
            (req.user.role==='admin') ? 'แอดมิน' : 'ผู้ซื้อ'

        const order = await Order.findById(id)
        if(!order){
            return res.send('ไม่พบออร์เดอร์นี้')
        }

        if(order.status==='ใหม่'){
            order.status = 'ยกเลิก'
            order.detail.seller = `ออร์เดอร์ หมายเลข ${id} ถูกยกเลิกโดย ${me}`
            order.detail.buyer = `ออร์เดอร์ หมายเลข ${id} ถูกยกเลิกโดย ${me}`
            order.detail.msg = `เนื่องจาก ${cancled_reason}`
            /* const cancle_order = await Order.findOneAndUpdate(
                {_id:id, status:'ใหม่'}, 
                {$set:{status:'ยกเลิก', detail:{
                    seller: `ออร์เดอร์ หมายเลข ${id} ถูกยกเลิกโดย ${me}`,
                    buyer: `ออร์เดอร์ หมายเลข ${id} ถูกยกเลิกโดย ${me}`,
                    msg: `เนื่องจาก ${cancled_reason}`
                }}}, 
                {new:true}
            ) */
            await order.save()
        }
        
        else if(order.status==='ตรวจสอบยอด'){
            order.status = 'ปฏิเสธ',
            order.detail.seller = `รอลูกค้าชำระเงินอีกครั้ง`
            order.detail.buyer = `ร้านค้าปฏิเสธการรับยอด กรุณาตรวจสอบการชำระเงินอีกครั้ง`
            order.detail.msg = `เนื่องจาก ${cancled_reason}`
            await order.save()
        }
        /* const notpaid_order = await Order.findOneAndUpdate(
            {_id:id, status:'ตรวจสอบยอด'}, 
            {$set:{
                status:'ปฏิเสธ', 
                detail:{
                    seller: `รอลูกค้าชำระเงินอีกครั้ง`,
                    buyer: `ร้านค้าปฏิเสธการรับยอด กรุณาตรวจสอบการชำระเงินอีกครั้ง`,
                    msg: `เนื่องจาก ${cancled_reason}`
                }
            }}, 
            {new:true}
        )
        if(!notpaid_order){
            return res.send('ไม่พบออร์เดอร์นี้')
        } */

        else {
            return res.send('ออร์เดอร์นี้ถูกยกเลิก หรือ ถูกปฏิเสธการชำระเงิน ไปแล้วนะจ๊ะ')
        }
        
        return res.send({
            message: `ออร์เดอร์ถูกยกเลิก หรือ ถูกปฏิเสธการชำระเงิน`,
            reason: order.detail.msg,
            order: order
        })
    }
    catch(err){
        console.log(err.message)
        res.send('ERROR can not cancle order')
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

// "ขายปลีก" get thire current order list  
exports.getMyPurchase = async (req, res) => {
    try{
        const myId = req.user.id

        const orders = await Order.find().populate('buyer').populate('seller')
        if(!orders || orders.length===0){
            return res.send('orders no found')
        }

        const myPurchases = orders.filter(item=>item.buyer._id.toString()===myId)
        const myNewPurchases = myPurchases.filter(item=>item.status==='ใหม่')
        const myAcceptedPurchase = myPurchases.filter(item=>item.status==='ยืนยัน')

        return res.send({
            message : `ออร์เดอร์ทั้งหมด = ${myPurchases.length}, ออร์เดอร์ใหม่ = ${myNewPurchases.length}, ออร์เดอร์ที่กำลังดำเนินการ = ${myAcceptedPurchase.length}`,
            myOrders: myPurchases
        })
    }
    catch(err){
        res.send('ERROR! can not get purchase')
        console.log(err.message)
    }
}

// "ขายส่ง" accepted an new order to processing
exports.acceptOrder = async (req, res) => {
    try {
        const {id} = req.params

        const accept_order = await Order.findOneAndUpdate(
            {_id:id, status:'ใหม่'}, 
            {$set:{status:'ยืนยัน', detail:{
                seller: `จัดเตรียมฉลากให้พร้อม รอลุกค้าชำระเงิน`,
                buyer: `ร้านค้ายืนยันแล้ว กรุณาชำระเงิน`,
            }}}, 
            {new:true}
        )
        if(!accept_order){
            return res.send('order not found or already accepted')
        }
        
        return res.send({
            message: `ร้านค้ารับออร์เดอร์แล้ว...กำลังจัดเตรียมฉลาก`,
            order: accept_order
        })

    }
    catch(err){
        res.send('ERROR! can not accept order')
        console.log(err.message)
    }
}

// "ขายส่ง" เตรียมพร้อมแล้ว รอเช็คเงินโอนจาก ขายปลีก
exports.readyOrder = async (req, res) => {
    try{
        const {id} = req.params
        const ready_order = await Order.findOneAndUpdate(
            {_id:id, status:'ยืนยัน'}, 
            {$set:{status:'รอชำระเงิน',
            detail:{
                seller: 'กรุณารอลูกค้าแจ้งชำระเงิน',
                buyer: 'ฉลากพร้อมแล้ว กรุณาชำระเงิน'
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
}

// "ขายปลีก" จ่ายเงินและแนบสลิป
exports.payment = async (req, res) => {
    try{
        const dataIds = req.dataIds
        const {id} = req.params

        const slip_img = (dataIds && dataIds.some(id => id.includes('slip_img/'))) 
            ? dataIds.filter(id => id.includes('slip_img/'))[0].replace('slip_img/', '')
            : null
            const slip_img_link = (slip_img) 
                ? `https://drive.google.com/file/d/${slip_img}/view` 
                : `none`

        const order = await Order.findByIdAndUpdate({_id:id, status:{$in:['ยืนยัน','ปฏิเสธ']}}, {$set:{paid_slip:slip_img_link,
            status: 'ตรวจสอบยอด',
            detail:{
                seller: 'ลูกค้าแจ้งชำระเงินแล้ว กรุณาตรวจสอบยอดโอน',
                buyer: 'กรุณารอร้านค้าตรวจสอบยอดเงิน'
            }
        }})
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

// "ขายส่ง" รับยอดโอน
exports.receipt = async (req, res) => {
    try{
        const {id} = req.params
        const bill_no = await genBill(id)
        const order = await Order.findByIdAndUpdate(
            {_id:id, status:'ตรวจสอบยอด'}, 
            {$set:{
                status:'ชำระแล้ว', 
                detail:{
                    seller: 'กรุณาส่งฉลาก หรือ รอลูกค้ารับฉลาก',
                    buyer: 'รอร้านค้าส่งฉลาก หรือ รับฉลากที่ร้านได้เลย'
                },
                bill_no:bill_no
            }}
        )
        if(!order){
            return res.send('order not found')
        }

        const cutStock = await cutStocks(order.lotto_id, order.buyer)
        if(!cutStock){
            return res.send('can not cut stock')
        }

        return res.send({
            message: 'ร้านค้ารับยอดเรียบร้อย...รอลูกค้ายืนยันรับของ',
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
        const {id} = req.params

        const seller_text = 'ออร์เดอร์สำเร็จ ลูกค้าได้รับฉลากแล้ว'
        const buyer_text = 'ออร์เดอร์สำเร็จ คุณได้รับฉลากแล้ว'

        const order = await Order.findByIdAndUpdate({_id:id, status:'ชำระแล้ว'}, {$set:{status:'สำเร็จ', detail:{
            seller: seller_text,
            buyer: buyer_text
        }}})
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

// get target order
exports.getOrder = async (req, res) => {
    try{
        const {id} = req.params
        const order = await Order.findById(id)
        if(!order){
            return res.send('order not found')
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

