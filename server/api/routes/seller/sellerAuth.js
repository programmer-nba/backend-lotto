// Login & Logout seller

const express = require('express')
const Seller = require('../../models/UsersModel/SellersModel.js')
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
        /* const sellerExisting = false */

        if(sellerExisting){
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
                    role : `${seller_role}`,
                    status: `pending`,

                    // for update
                    email,
                    address,
                    
                    shop_location,
                    shop_name,

                    personal_img,
                    shop_img,
                    shop_bank, 
                    shop_logo,
                }
            )
    
            await newSeller.save()
            res.send('ลงทะเบียนเสร็จสิ้น ! กรุณารอแอดมินยืนยันข้อมูลเพื่อเข้าสู่ระบบ')

        }
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
})


// [Login] 
route.post('/login', async (req,res,next)=>{

    const { password, phone_number } = req.body

    try{
        
        const seller = await Seller.findOne({phone_number})
        
        if(!seller){ 
            res.status(404).json({message: `ไม่พบผู้ใช้งานนี้ในระบบ กรุณาลงทะเบียนผู้ใช้ใหม่`}) 
        } else if(seller.password !== password ){
            res.status(404).json({message: `รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง`})
        } else if(seller.status === 'pending') {
            res.send({message:"บัญชีของคุณอยู่ในระหว่างการตรวจสอบ กรุณารอซักครู่", status:seller.status})
        } else if(seller.status === 'cancle'){
            res.send({message:"บัญชีของคุณถูกยกเลิก เนื่องจากมีข้อมูลผิดพลาด กรุณาลงทะเบียนใหม่อีกครั้ง", status:seller.status})
        }
        
        else {
            // user logged in successfully then genarate token
            const token = jwt.sign({ id: seller._id, role: seller.role, status: seller.status }, 'your-secret-key', { expiresIn: '1h' })
            res.status(200).json({
            token, 
            status: seller.status
            })
        }
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
})


module.exports = route