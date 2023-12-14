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

    const shop_img = (dataIds && dataIds.length>0 && dataIds.some(id => id.includes('shop_img/'))) 
        ? dataIds.filter(id => id.includes('shop_img'))[0].replace('shop_img/', '')
        : null
        const shop_img_link = (shop_img) 
            ? `https://drive.google.com/file/d/${shop_img}/view` 
            : prev_info.shop_img

    const shop_cover = (dataIds && dataIds.length>0 && dataIds.some(id => id.includes('shop_cover/'))) 
        ? dataIds.filter(id => id.includes('shop_cover'))[0].replace('shop_cover/', '')
        : null
        const shop_cover_link = (shop_cover && dataIds.some(id => id.includes('shop_cover/'))) 
            ? `https://drive.google.com/file/d/${shop_cover}/view` 
            : prev_info.shop_cover

    const shop_bank = (dataIds && dataIds.length>0 && dataIds.some(id => id.includes('shop_bank/')))
        ? dataIds.filter(id => id.includes('shop_bank'))[0].replace('shop_bank/', '')
        : null
        const shop_bank_link = (shop_bank) 
            ? `https://drive.google.com/file/d/${shop_bank}/view` 
            : prev_info.shop_bank

    const personal_img = (dataIds && dataIds.length>0 && dataIds.some(id => id.includes('personal_img/'))) 
        ? dataIds.filter(id => id.includes('personal_img'))[0].replace('personal_img/', '')
        : null
        const personal_img_link = (personal_img) 
            ? `https://drive.google.com/file/d/${personal_img}/view` 
            : prev_info.personal_img

    const personWithCard = (dataIds && dataIds.length>0 && dataIds.some(id => id.includes('personWithCard/'))) 
        ? dataIds.filter(id => id.includes('personWithCard'))[0].replace('personWithCard/', '')
        : null
        const personWithCard_link = (personWithCard) 
            ? `https://drive.google.com/file/d/${personWithCard}/view` 
            : prev_info.personWithCard
    
    const personWithShop = (dataIds && dataIds.length>0 && dataIds.some(id => id.includes('personWithShop/'))) 
        ? dataIds.filter(id => id.includes('personWithShop'))[0].replace('personWithShop/', '')
        : null
        const personWithShop_link = (personWithShop) 
            ? `https://drive.google.com/file/d/${personWithShop}/view` 
            : prev_info.personWithShop

    try{

        const { address, shop_name, shop_number, phone_number } = req.body
        
        const new_province = (address.province!=='') ? address.province : prev_info.address.province
        const new_district = (address.district!=='') ? address.district : prev_info.address.district
        const new_subdistrict = (address.subdistrict!=='') ? address.subdistrict : prev_info.address.subdistrict
        const new_postcode = (address.postcode!=='') ? address.postcode : prev_info.address.postcode
        const new_address = (address.address!=='') ? address.address : prev_info.address.address

        const newAddress = {
            province: new_province,
            district: new_district,
            subdistrict: new_subdistrict,
            postcode: new_postcode,
            address: new_address
        }

        const new_shop_name = (shop_name!=='') ? shop_name : prev_info.shop_name
        const new_shop_number = (shop_number!=='') ? shop_number : prev_info.shop_number
        const new_phone_number = (phone_number!=='') ? phone_number : prev_info.phone_number

        const seller = await Seller.findByIdAndUpdate(userId, {
            address: newAddress,
            shop_name: new_shop_name,
            shop_number: new_shop_number,
            phone_number: new_phone_number,

            // img
            personal_img : personal_img_link,
            shop_img : shop_img_link,
            shop_bank: shop_bank_link, 
            shop_cover : shop_cover_link,
            personWithCard: personWithCard_link,
            personWithShop: personWithShop_link,


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
        res.send(err.message)
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
        const success = order.filter(item=>item.status==='สำเร็จ')
        const revenue = success.map(item=>{
            return item.price.total
        })
        const orderReport = {
            total: order.length,
            success: order.filter(item=>item.status==='สำเร็จ').length,
            current: {
                total: order.filter(item=>item.status!=='สำเร็จ').length,
                new: order.filter(item=>item.status==='ใหม่').length,
                accepted: order.filter(item=>item.status==='ยืนยัน').length,
                pending: order.filter(item=>item.status==='รอตรวจสอบ').length,
                paid: order.filter(item=>item.status==='ชำระแล้ว').length,
            },
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
            on_market: {
                total: lotto.filter(item=>item.on_order===false).length,
                all: lotto.filter(item=>item.market==='all' && item.on_order===false).length ,
                wholeSale: lotto.filter(item=>item.market==='wholesale' && item.on_order===false).length ,
                retail: lotto.filter(item=>item.market==='retail' && item.on_order===false).length ,
                none: lotto.filter(item=>item.market==='none' && item.on_order===false).length 
            },
            on_order: lotto.filter(item=>item.on_order===true).length
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