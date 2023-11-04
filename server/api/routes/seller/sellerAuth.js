// Login & Logout seller

const express = require('express')
const Seller = require('../../models/UsersModel/SellersModel.js')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const route = express.Router()

route.use(bodyParser.urlencoded({extended: true}))
route.use(bodyParser.json())

// [Register]
route.post('/register', async (req,res,next)=>{
    const {
        username, email, password, seller_role,
        line_id, first_name, last_name, phone_number, address, personal_id, personal_img,
        shop_name, shop_location, shop_img, shop_qrcode
    } = req.body

    try{
        const sellerExisting = await Seller.findOne({username})

        if(sellerExisting){
            res.send('Username, Email, Phone number, Line id, Personal id or Shop name already exist, please try another') // update next time
        } else {
            const newSeller = new Seller(
                {
                    username, 
                    email, 
                    password, 
                    phone_number,
                    line_id,
                    first_name,
                    last_name,
                    address,
                    personal_id,
                    shop_name,
                    role : `seller #${seller_role}`,
                    status: `pending`
                }
            )
    
            await newSeller.save()
            res.send({data:newSeller})

        }
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
})


// [Login] 
route.post('/login', async (req,res,next)=>{

    const {
        username=null, email=null, password,
        line_id=null, phone_number=null, personal_id=null
    } = req.body

    try{
        let seller = null

        if(username!==null){
            seller = await Seller.findOne({username})
        } else if(phone_number!==null) {
            seller = await Seller.findOne({phone_number})
        } else if(email!==null) {
            seller = await Seller.findOne({email})
        } else if(line_id!==null) {
            seller = await Seller.findOne({line_id})
        } else if(personal_id==null) {
            seller = await Seller.findOne({personal_id})
        } 
        
        if(seller===null){ 
            res.status(404).json({message: `ไม่พบผู้ใช้งานนี้ในระบบ กรุณาลงทะเบียนผู้ใช้ใหม่`}) 
        } else if(seller.password !== password){
            res.status(404).json({message: `รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง`})
        } else {
            // user logged in successfully then genarate token
            const token = jwt.sign({ userId: seller._id, username: seller.username, userRole: seller.role }, 'your-secret-key', { expiresIn: '1h' })
            res.status(200).json({message: `ยินดีต้อนรับ คุณ ${seller.username}`, token, data:seller})
        }
            
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
})


module.exports = route