// CRUD user data by using ID

const express = require('express')
const User = require('../../models/UsersModel/UsersModel.js')
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

// get list of all users
route.get('/all', verifyToken, async (req,res,next)=>{

    const token = req.header('token')
    const decoded = jwt.verify(token, 'your-secret-key')
    const userId = decoded.id
    const userRole = decoded.role

    console.log(userRole)
    try{

        if(userRole !== 'admin'){
            res.send('ขออภัย คุณไม่ได้รับอณุญาติให้เข้าถึงข้อมูลนี้')
        } else {
            const users = await User.find()
            res.send(users)
        }

    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})


// get an user by id
route.get('/:id', async (req,res,next)=>{
    try{
        const {id} = req.params
        const user = await User.findById(id)

        if(!user) {
            res.status(404).send('user not found')
        } 
        res.status(201).send(user)
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

// update an user data
route.put('/:id',  async (req,res,next)=>{
    try{
        const {
            username, email, password, seller_role,
            line_id, first_name, last_name, phone_number, address, personal_id, personal_img,
            shop_name, shop_location, shop_img, shop_qrcode, shop_logo
        } = req.body

        const user = await User.findByIdAndUpdate(token._id, req.body)

        res.send('update user info success!')
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

// delete an user from database (**pending...**)
route.delete('/:id', async (req,res,next)=>{
    try{
        const {id} = req.params
        const user = await User.findByIdAndDelete(id)
        res.send('delete user success!')
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

module.exports = route