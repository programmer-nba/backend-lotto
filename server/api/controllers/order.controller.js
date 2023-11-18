// database
const Lotto = require('../models/Products/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')
const Preorder = require('../models/Orders/Preorder.model.js')

// create an order (wholesalemarket)
exports.createPreOrder = async (req, res) => {

    const sellerRole = req.user.seller_role
    const {lotto_id, buyer_id} = req.body
    console.log(req.body)
    try{
        if(sellerRole !== 'ขายปลีก'){
            return res.send('ต้องเป็น seller ขายปลีก เท่านั้น')
        }

        const market = await Lotto.findById(lotto_id)

        const bill_no = genBill(sellerRole, market)

        const newPreOrder = new Preorder({
            lotto_id: lotto_id,
            buyer_id: buyer_id,
            bill_no: bill_no,
        })
        
        console.log(lotto_id)

        if(!newPreOrder){
            return res.send('con not create new pre-order!')
        }

        newPreOrder.save()

        const preOrder = await Preorder.findById(newPreOrder._id)
        if(!preOrder){
            return res.send('not found order!')
        }

        const seller = await preOrder.populate({
            path: 'lotto_id',
            populate: {path: 'seller_id'}
        })

        const buyer = await preOrder.populate('buyer_id')

        return res.send({
            message: 'create new pre-order success!',
            newPreOrder,
            /* seller: seller,
            buyer: buyer, */
            bill_no: bill_no,
            success: true
        })
    }
    catch(error){
        res.send('ERROR! can not create preorder, please check console!')
        console.log(error.message)
    }
}

exports.getAllPreOrders = async (req, res) => {

    const userRole = req.user.role

    try{
        if(userRole !== 'admin'){
            return res.send('admin role only!')
        }

        const orders = await Preorder.find()
        if(!orders || orders.length < 1){
            return res.send(`ไม่มี pre-order ในขณะนี้ กรุณารอ order ใหม่`)
        }

        return res.send({
            message: `มีออร์เดอร์ตอนนี้ ทั้งหมด : ${orders.length} ออร์เดอร์`,
            orders
        })
    }
    catch(error){
        console.log(error.message)
        res.send('ERROR can not get pre-orders, please check console')
    }
}

const genBill = (role, market) => {
    const date_code = Date.now().toString()

    const market_code = 
        (market==='all') ? 'A' : 
        (market==='wholesale') ? 'W'
        : 'R'

    const role_code = (role==='ขายปลีก') ? '01' : '02'

    const result = `${market_code}${role_code}${date_code}`

    return result
}