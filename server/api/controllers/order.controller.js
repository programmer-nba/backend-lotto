const Order = require('../models/Orders/Order.model.js')
const Lotto = require('../models/Products/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js');

const genBill = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 as month is zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const numericDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;

    const result = `02${numericDateTime}`
    return result
}

const genOrderNo = async () => {
    const order = await Order.find()
    const code = `${order.length}`
    const result = (code<10) ? `00${code}` : (code>=10 && code<100) ? `0${code}` : `${code}`
    return result
}

exports.createOrder = async (req, res) => {
    try{
        const {lotto_id} = req.body
        const buyer_id = req.user.id
        const buyer_role = req.user.seller_role
        const buyer_name = req.user.name
        
        if(buyer_role!=='ขายปลีก'){
            return res.send('you are not allowed')
        }

        const order_no = await genOrderNo()

        const lotto = await Lotto.findById(lotto_id[0])
        if(!lotto){
            return res.send('lotto id not found')
        }
        const seller_id = lotto.seller_id

        const new_order = {
            lotto_id: lotto_id,
            buyer: buyer_id,
            seller: seller_id,
            status: 'new',
            order_no: order_no
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
        await timeOut(order._id ,lotto_id, timeBeforeDelete)

        return res.send({
            message: `สร้างออร์เดอร์สำเร็จ มีสินค้าทั้งหมด ${order.lotto_id.length} ชิ้น`,
            order_id: order._id,
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

const timeOut = async (order_id, lotto_id, seconds) => {
    
    setTimeout(async () => {
        for(i in lotto_id){
            const lotto = await Lotto.findById(lotto_id[i])
            if(lotto.on_order){
                await Lotto.findByIdAndUpdate(lotto_id[i], {on_order: false})
                console.log(`order cancle > lotto is backing to market`)
            } else {
                console.log(`order confirm > lotto is on process...`)
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

exports.getAllOrders = async (req, res) => {
    try{
        const userRole = req.user.role
        if(userRole!=='admin'){
           return res.send('you are not allowed!') 
        }
        
        const orders = await Order.find()
        if(!orders || orders.length===0){
            res.send(`มีออร์เดอร์ในระบบ ${orders.length} ออร์เดอร์`)
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
        } else {
            const myNewOrders = myOrders.filter(item=>item.status==='new')

            return res.send({
                message: `ออร์เดอร์ใหม่= ${myNewOrders.length}, ออร์เดอร์ทั้งหมด= ${myOrders.length}`,
                myOrders: myOrders
            })
        }
    }
    catch(error){
        res.send('ERROR con not get my orders')
        console.log(error.message)
    }
}

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

// for "ขายปลีก" seller
exports.getMyPurchase = async (req, res) => {
    try{
        const myId = req.user.id

        const orders = await Order.find().populate('buyer').populate('seller')
    
        if(!orders || orders.length===0){
            return res.send('orders no found')
        }

        const myPurchases = orders.filter(item=>item.buyer._id.toString()===myId)
        const myNewPurchases = myPurchases.filter(item=>item.status==='new')

        return res.send({
            message : `ออร์เดอร์ทั้งหมด = ${myPurchases.length}, ออร์เดอร์ใหม่ = ${myNewPurchases.length}`,
            myOrders: myPurchases
        })
    }
    catch(err){
        res.send('ERROR! can not get purchase')
        console.log(err.message)
    }
}