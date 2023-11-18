const Order = require('../models/Orders/Order.model.js')
const Lotto = require('../models/Products/lotto.model.js')

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

exports.createOrder = async (req, res) => {
    try{
        const {lotto_id} = req.body
        const buyer_id = req.user.id
        const buyer_role = req.user.seller_role
        const buyer_name = req.user.name
        
        if(buyer_role!=='ขายปลีก'){
            return res.send('you are not allowed')
        }

        const bill_no = genBill()

        const new_order = {
            lotto_id: lotto_id,
            buyer_id: buyer_id,
            bill_no: bill_no,
        }

        const existing_order = await Order.findOne({lotto_id:lotto_id})
        if(existing_order){
            return res.send('มีออร์เดอร์นี้แล้ว')
        }
        
        const order = await Order.create(new_order)
        
        if(!order){
            return res.send('order not created')
        }

        await Lotto.findByIdAndUpdate(lotto_id, {on_order: true})
            .catch(err => res.send('id of lotto not found'))

            res.send({
            message: `Order created successfully`,
            order_id: order._id,
            bill_no: order.bill_no,
            buyer_name: buyer_name,
            order_start: order.createdAt,
            status: 'กำลังรอร้านค้ายืนยัน...'
        })

        const timeBeforeDelete = 30
        timeOut(order._id ,lotto_id, timeBeforeDelete)

    }
    catch(err){
        res.send(`Error creating order: ${err.message}`)
        console.log(err.message)
    }
}

const timeOut = async (order_id, lotto_id, seconds) => {
    
    setTimeout(async () => {
        const lotto = await Lotto.findById(lotto_id)
        if(lotto.on_order){
            await Order.findByIdAndDelete(order_id)
            console.log(`Deleted order ID ${order_id} successfully`)
            await Lotto.findByIdAndUpdate(lotto_id, {on_order: false})
            await Lotto.findById(lotto_id).then((res) =>console.log(`set on_order to ${res.on_order} > back to market`))
        } else {
            console.log(`on_order = ${lotto.on_order}`)
        }
    }, seconds*1000)

}