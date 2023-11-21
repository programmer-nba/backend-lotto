// import database
const Seller = require('../models/UsersModel/SellersModel.js')

// update profile
exports.editMyProfile = async (req, res)=> {

    const dataIds = req.dataIds
    console.log(dataIds.length)

    const shop_img = (dataIds.length>0 && dataIds.some(id => id.includes('shop_img/'))) 
        ? dataIds.filter(id => id.includes('shop_img'))[0].replace('shop_img/', '')
        : null
        const shop_img_link = (shop_img) 
            ? `https://drive.google.com/file/d/${shop_img}/view` 
            : `https://drive.google.com/file/d/1k7aUdgwRxAiVuq4a9lzQAstUQZ9JEfoG/view`

    const shop_cover = (dataIds.length>0 && dataIds.some(id => id.includes('shop_cover/'))) 
        ? dataIds.filter(id => id.includes('shop_cover'))[0].replace('shop_cover/', '')
        : null
        const shop_cover_link = (shop_cover && dataIds.some(id => id.includes('shop_cover/'))) 
            ? `https://drive.google.com/file/d/${shop_cover}/view` 
            : `https://drive.google.com/file/d/1JBSYh7BdZTPHIxCrxQ7Talpp9R-hDRK7/view`

    const shop_bank = (dataIds.length>0 && dataIds.some(id => id.includes('shop_bank/')))
        ? dataIds.filter(id => id.includes('shop_bank'))[0].replace('shop_bank/', '')
        : null
        const shop_bank_link = (shop_bank) 
            ? `https://drive.google.com/file/d/${shop_bank}/view` 
            : `https://drive.google.com/file/d/1DMQ4c8_K5HBmSyremT80Q2KXySYIPOJ6/view`

    const personal_img = (dataIds.length>0 && dataIds.some(id => id.includes('personal_img/'))) 
        ? dataIds.filter(id => id.includes('personal_img'))[0].replace('personal_img/', '')
        : null
        const personal_img_link = (personal_img) 
            ? `https://drive.google.com/file/d/${personal_img}/view` 
            : `https://drive.google.com/file/d/1C7EGQr0qIuiXdA8HCGU1C-C2imzseg-W/view`

    try{

        const {address}=req.body
        
        const userId = req.user.id

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