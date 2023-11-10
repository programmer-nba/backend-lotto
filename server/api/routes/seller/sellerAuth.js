// Login & Logout seller

const express = require('express')
const Seller = require('../../models/UsersModel/SellersModel.js')
const User = require('../../models/UsersModel/UsersModel.js')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const route = express.Router()

// middleware
route.use(bodyParser.urlencoded({extended: true}))
route.use(bodyParser.json())


// ROUTES --------------
// [Register]
route.post('/register', async (req,res,next)=>{
    const {
        password, seller_role, line_id, email,
        name, phone_number, address, personal_id, personal_img,
        shop_name, shop_location, shop_img, shop_bank, shop_logo
    } = req.body

    try{
        const sellerExisting = await Seller.findOne({phone_number})
        const userExisting = await User.findOne({phone_number})

        if(sellerExisting || userExisting){
            res.json({message:'เบอร์มือถือนี้มีผู้ใช้งานแล้ว กรุณาลองใหม่อีกครั้ง'})
        } 
        else {
            const newSeller = new Seller(
                {
                    // required form
                    phone_number,
                    password,
                    name,
                    line_id,
                    personal_id,
                    // defualt
                    role : `seller`,
                    seller_role: seller_role,
                    status: `กำลังตรวจสอบ`,

                    // for update
                    email,
                    address,
                    
                    shop_location,
                    shop_name: shop_name || name,

                    personal_img,
                    shop_img,
                    shop_bank, 
                    shop_logo,
                }
            )
    
            await newSeller.save()
            res.send({
                message: 'ลงทะเบียนเสร็จสิ้น ! กรุณารอแอดมินยืนยันข้อมูลเพื่อเข้าสู่ระบบ',
                id: newSeller._id,
                role: newSeller.role,
                seller_role: newSeller.seller_role,
                status: newSeller.status,
                success: true
            })

        }
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
})


// [Login] 
/* route.post('/login', async (req,res,next)=>{

    const { password, phone_number } = req.body

    try{
        
        const seller = await Seller.findOne({phone_number})
        
        if(!seller){ 
            res.status(404).json({message: `ไม่พบผู้ใช้งานนี้ในระบบ กรุณาลงทะเบียนผู้ใช้ใหม่`}) 
        } else if(seller.password !== password ){
            res.status(404).json({message: `รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง`})
        } else if(seller.status === 'pending') {
            res.send({message:"บัญชีของคุณอยู่ในระหว่างการตรวจสอบ กรุณารอซักครู่", status:seller.status, role:seller.role, seller_role:seller.seller_role})
        } else if(seller.status === 'cancle'){
            res.send({message:"บัญชีของคุณถูกยกเลิก เนื่องจากมีข้อมูลผิดพลาด กรุณาลงทะเบียนใหม่อีกครั้ง", status:seller.status, role:seller.role, seller_role:seller.seller_role})
        }
        
        else {
            // user logged in successfully then genarate token
            const token = jwt.sign({ id: seller._id, role: seller.role, status: seller.status, seller_role: seller.seller_role }, 'your-secret-key', { expiresIn: '1h' })
            res.status(200).json({
            token, 
            status: seller.status,
            role: seller.role,
            seller_role: seller.seller_role,
            id: seller._id,
            success: true,
            name: seller.name
            })
        }
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
}) */


module.exports = route