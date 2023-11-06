// Login & Logout seller

const express = require('express')
const Seller = require('../../models/UsersModel/SellersModel.js')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const path = require('path')

const route = express.Router()

route.use(bodyParser.urlencoded({extended: true}))
route.use(bodyParser.json())



/* const multer = require('multer')
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../server/public/images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)
    }
})

const upload = multer({storage:fileStorageEngine})

route.post("/single", upload.single("image"), (req, res)=>{
    console.log(req.file)
    res.send("single file upload success")
})

route.get('/getImageURL', (req, res) => {
    const imagePath = path.join(__dirname, '../../../public/images/1699239409908--Lottery-Center-Logo.png')
    res.sendFile(imagePath)
  }) */



// [Register]
route.post('/register', async (req,res,next)=>{
    const {
        username, password, seller_role,
        line_id, first_name, last_name, phone_number, address, personal_id, personal_img,
        shop_name, shop_location, shop_img, shop_bank, shop_logo
    } = req.body

    try{
        const sellerExisting = await Seller.findOne({username})

        if(sellerExisting){
            res.json({message:'Username, Phone number, Line id, Personal id or Shop name already exist, please try another'})
        } 
        else if (username.toLowerCase() === 'admin'){
            res.json({message:'Username can not be "admin", please try another'})
        }
        else {
            const newSeller = new Seller(
                {
                    username, 
                    password, 
                    phone_number,
                    line_id,
                    first_name,
                    last_name,
                    address,
                    personal_id,
                    shop_name,
                    role : `${seller_role}`,
                    status: `pending`,
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
            const token = jwt.sign({ _id: seller._id, username: seller.username, role: seller.role }, 'your-secret-key', { expiresIn: '1h' })
            res.status(200).json({
            message: `ยินดีต้อนรับ คุณ ${seller.username}`, 
            token, 
            data:seller
            })
        }
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
})


module.exports = route