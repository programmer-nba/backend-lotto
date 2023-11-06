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
            res.send({sellers})
        } else {
            res.send({message: 'ขออภัย คุณไม่ได้รับอณุญาติให้เข้าถึงข้อมูลนี้'})
        }
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

    const {seller_status, seller_id} = req.body
    const token = req.header("token")
    const decoded = jwt.verify(token, "your-secret-key")
    const userRole = decoded.role

    try{
        
        if(userRole!=='admin'){

            res.send('ขออภัย คุณไม่ได้รับอณุญาติให้เข้าถึงข้อมูลนี้')

        } 

        const seller = await Seller.findByIdAndUpdate(seller_id, {status:seller_status})

        if(seller_status === 'cancle'){
            res.send(`username : ${seller.username} ถูกยกเลิกการสมัคร เนื่องจากข้อมูลผิดพลาด กรุณาติดต่อแอดมิน`)
        } else {
            res.send(`ยินดีด้วย ! username : ${seller.username} ผ่านการอณุมัติเรียบร้อย`)
        }
        
        
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

// delete an seller from database*****
route.delete('/:id', async (req,res,next)=>{
    try{
        const {id} = req.params
        const seller = await Seller.findByIdAndDelete(id)
        res.json({message:'delete seller success!'})
    }
    catch(err){
        res.json({ERROR : 'please check console'})
        console.log({ERROR:err.message})
    }
})

module.exports = route