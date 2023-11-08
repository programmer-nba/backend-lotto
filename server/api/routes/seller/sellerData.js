// CRUD seller data by using ID

const express = require('express')
const Seller = require('../../models/UsersModel/SellersModel.js')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const route = express.Router()

route.use(bodyParser.urlencoded({extended: true}))
route.use(bodyParser.json())

// verify token
function verifyToken(req, res, next) {
    const token = req.header('token');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        req.user = decoded;
        next();
    });
}

// get list of all sellers [role = admin]
route.get('/all', verifyToken, async (req,res,next)=>{

    const token = req.header('token')
    const decoded = jwt.verify(token, 'your-secret-key')
    const userRole = decoded.role

    try{

        if(userRole === 'admin'){
            const sellers = await Seller.find()
            res.send(sellers)
        } else {
            res.send({message: 'ขออภัย คุณไม่ได้รับอณุญาติให้เข้าถึงข้อมูลนี้'})
        }
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

// get list of all sellers [role = admin] demo
route.get('/all/demo', async (req,res,next)=>{

    try{
        const sellers = await Seller.findById("654b2b5eff61aa217b0ae667")
        res.send(sellers)   
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

// update an seller data****
route.put('/edit',  async (req,res,next)=>{

    const {
        email, password, seller_role,
        line_id, phone_number, address, personal_img,
        shop_name, shop_location, shop_img, shop_qrcode
    } = req.body

    try{
        
        const {id} = req.params
        const seller = await Seller.findByIdAndUpdate(id, req.body)

        res.send('update profile success!')
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

// update an seller status [role = admin]
route.put('/status', verifyToken, async (req,res,next)=>{

    const {status, _id} = req.body
    const token = req.header("token")
    const decoded = jwt.verify(token, "your-secret-key")
    const userRole = decoded.role

    try{
        
        if(userRole!=='admin'){

            res.send('ขออภัย คุณไม่ได้รับอณุญาติให้เข้าถึงข้อมูลนี้')

        } 

        const seller = await Seller.findByIdAndUpdate(_id, {status:status})

        if(status === 'cancle'){
            res.send(`${seller.name} อัพเดทสถานะเป็น cancle เรียบร้อย`)
        } else {
            res.send(`${seller.name} อัพเดทสถานะเป็น confirm เรียบร้อย`)
        }
        
        
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

// delete all sellers from database
route.delete('/clearall', verifyToken, async (req,res,next)=>{
    try{

        const token = req.header("token")
        const decoded = jwt.verify(token, "your-secret-key")
        const userRole = decoded.role

        if(userRole !== 'admin'){
            res.send("ขออภัยคุณไม่ใช่ admin ไม่สามารถทำรายการนี้ได้")
        }

        await Seller.deleteMany({})
        res.json({message:'delete seller success!'})
    }
    catch(err){
        res.json({ERROR : 'please check console'})
        console.log({ERROR:err.message})
    }
})

module.exports = route