const Order = require('../models/Orders/Order.model.js')
const Lotto = require('../models/Products/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js');

const genBill = (id) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 as month is zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const numericDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;

    const result = `${id}${numericDateTime}`
    return result
}

const genOrderNo = async (id) => {
    const order = await Order.find()
    const code = `${order.length}`
    const id_code = `${id[0]}${id[2]}${id[4]}`
    const result = (code<10) ? `00${code}${id_code}` : (code>=10 && code<100) ? `0${code}${id_code}` : `${code}${id_code}`
    return result
}

const timeOut = async (order_id, seconds) => {

    setTimeout(async () => {
        const order = await Order.findById(order_id)
        for(i in order.lotto_id){
            const lotto = await Lotto.findById(order.lotto_id[i])
            if(lotto.on_order && order.status==='new'){
                await Lotto.findByIdAndUpdate(order.lotto_id[i], {on_order: false})
                console.log(`order cancle > lotto is backing to market`)
            } else {
                console.log(`--> lotto is (accepted or cancled)`)
            }
        }
    }, seconds*1000)

    setTimeout(async () => {
        const order = await Order.findById(order_id)
        if(order.status==='new'){
            await Order.findByIdAndUpdate(order_id, {status:'timeout'})
            console.log(`order time-out`)
        } else {
            console.log(`order confirm > order is on process...`)
        }
    }, seconds*1000)

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
        const seller_id = lotto.seller_id 

        const buyer = await Seller.findById(buyer_id)
        if(!buyer){
            buyer = 'ไม่ได้เพิ่มที่อยู่'
        }

        const transferBy = (transfer==='address') ? buyer.address : transfer  

        const order_no = await genOrderNo(lotto_id[0])

        const new_order = {
            lotto_id: lottos,
            buyer: buyer_id,
            seller: seller_id,
            status: 'new',
            order_no: order_no,
            transferBy: transferBy,
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

        const myNewOrders = myOrders.filter(item=>item.status==='new')
        const myAcceptedOrders = myOrders.filter(item=>item.status==='accepted')
        
       

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

// seller cancle a current new order
exports.cancleOrder = async (req, res) => {
    try{
        const {id} = req.params

        const me = 
            (req.user.seller_role==='ขายส่ง') ? 'ร้านค้า' :
            (req.user.role==='admin') ? 'แอดมิน' : 'ผู้ซื้อ'

        const cancle_order = await Order.findOneAndUpdate(
            {_id:id, status:'new'}, 
            {$set:{status:'cancle', detail:`ยกเลิกโดย ${me}`}}, 
            {new:true}
        )
        if(!cancle_order){
            return res.send('ไม่พบออร์เดอร์นี้')
        }
        
        return res.send({
            message: `ยกเลิกออร์เดอร์ หมายเลข ${cancle_order.order_no} โดย ${me}`,
            order: cancle_order
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
        const myNewPurchases = myPurchases.filter(item=>item.status==='new')
        const myAcceptedPurchase = myPurchases.filter(item=>item.status==='accepted')

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
            {_id:id, status:'new'}, 
            {$set:{status:'accepted'}}, 
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
            {_id:id, status:'accepted'}, 
            {$set:{status:'ready'}}, 
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

        const order = await Order.findByIdAndUpdate({_id:id, status:'ready'}, {$set:{paid_slip:slip_img_link}})
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
        const order = await Order.findByIdAndUpdate({_id:id, status:'ready'}, {$set:{status:'paid'}})
        if(!order){
            return res.send('order not found')
        }

        const bill_no = genBill(id)

        return res.send({
            message: 'ร้านค้ารับยอดเรียบร้อย...รอลูกค้ามารับของ',
            bill_no: bill_no
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
        const order = await Order.findByIdAndUpdate({_id:id, status:'paid'}, {$set:{status:'done'}})
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

