// import database
const Seller = require('../models/UsersModel/SellersModel.js')
const Order = require('../models/Orders/Order.model.js')
const Lotto = require('../models/Products/lotto.model.js')

// update profile
exports.editMyProfile = async (req, res)=> {
    const userId = req.user.id
    const dataIds = req.dataIds

    const prev_info = await Seller.findById(userId)
    if(!prev_info){
        return res.send('user not found')
    }

    const shop_img = (dataIds.length>0 && dataIds.some(id => id.includes('shop_img/'))) 
        ? dataIds.filter(id => id.includes('shop_img'))[0].replace('shop_img/', '')
        : null
        const shop_img_link = (shop_img) 
            ? `https://drive.google.com/file/d/${shop_img}/view` 
            : prev_info.shop_img

    const shop_cover = (dataIds.length>0 && dataIds.some(id => id.includes('shop_cover/'))) 
        ? dataIds.filter(id => id.includes('shop_cover'))[0].replace('shop_cover/', '')
        : null
        const shop_cover_link = (shop_cover && dataIds.some(id => id.includes('shop_cover/'))) 
            ? `https://drive.google.com/file/d/${shop_cover}/view` 
            : prev_info.shop_cover

    const shop_bank = (dataIds.length>0 && dataIds.some(id => id.includes('shop_bank/')))
        ? dataIds.filter(id => id.includes('shop_bank'))[0].replace('shop_bank/', '')
        : null
        const shop_bank_link = (shop_bank) 
            ? `https://drive.google.com/file/d/${shop_bank}/view` 
            : prev_info.shop_bank

    const personal_img = (dataIds.length>0 && dataIds.some(id => id.includes('personal_img/'))) 
        ? dataIds.filter(id => id.includes('personal_img'))[0].replace('personal_img/', '')
        : null
        const personal_img_link = (personal_img) 
            ? `https://drive.google.com/file/d/${personal_img}/view` 
            : prev_info.personal_img

    try{

        const {address}=req.body

        const seller = await Seller.findByIdAndUpdate(userId, {
            address:address,
            // img
            personal_img : personal_img_link,
            shop_img : shop_img_link,
            shop_bank: shop_bank_link, 
            shop_cover : shop_cover_link,
        }, {new:true})
        if(!seller){
            return res.send('can not update profile')
        }

        return res.send({
            message:"อัพเดทข้อมูลส่วนตัวเสร็จสิ้น",
            seller
        })
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
}

// shop data & report
exports.shopData = async (req, res) => {
    const userRole = req.user.role
    if(userRole!=='seller'){
        return res.send({
            message: "ขออภัยคุณไม่ใช่ 'คนขาย' ไม่สามารถเข้าดูรายการนี้ได้"
        })
    }
    const userId = req.user.id
    const date = req.config.period

    try {
        // seller data
        const seller = await Seller.findById(userId)
        if(!seller){
            return res.send({
                message: "ไม่พบข้อมูลส่วนตัวของคุณ"
            })
        }

        // order data
        const order = await Order.find({seller:userId})
        if(!order){
            return res.send({
                message: "ไม่พบรายการขาย"
            })
        }
        const revenue = order.map(item=>{
           
            return item.price.total
        })
        const orderReport = {
            total: order.length,
            success: order.filter(item=>item.status==='สำเร็จ').length || 0,
            revenue: revenue.reduce((a, b) => a + b, 0)
        }

        // lotto data
        const lotto = await Lotto.find({seller_id:userId})
        if(!lotto){
            return res.send({
                message: "ไม่พบข้อมูลหวย"
            })
        }
        const lottoReport = {
            tatal : lotto.length,
            all: lotto.filter(item=>item.market==='all').length ,
            wholeSale: lotto.filter(item=>item.market==='wholesale').length ,
            retail: lotto.filter(item=>item.market==='retail').length ,
            none: lotto.filter(item=>item.market==='none').length
        }

        const Report = {
            period: date,
            lotto : lottoReport,
            order : orderReport,
        }

        return res.send({
            message: "report success!",
            success: true,
            seller: seller.shop_name,
            Report,
        })
        
    }
    catch(err){
        res.send('ERROR [shopData] : please check console')
        console.log('-------------------')
        console.log({ERROR:err.message})
        console.log('-------------------')
    }
}