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

// get list of all users [role = admin]
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


// update an user data
route.put('/edit', verifyToken, async (req,res,next)=>{
    try{
        const token = req.header('token')
        const decoded = jwt.verify(token, "your-secret-key")
        const userId = decoded.id

        const {password, phone_number, name, address, line_id} = req.body

        const user = await User.findByIdAndUpdate(userId, req.body)

        res.send({
            message: "อัพเดทข้อมูลสำเร็จ",
            success: true
        })
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({
            ERROR:err.message,
            success: false
        })
    }
})

// delete all user from database [ADMIN only]
route.delete('/clear', async (req,res,next)=>{
    try{
        const token = req.header("token")
        const decoded = jwt.verify(token, "your-secret-key")
        const userRole = decoded.role

        if(userRole !== "admin"){
            res.send("ขออภัยคุณไม่ใช่ admin ไม่สามารถทำรายการนี้ได้")
        }

        await User.deleteMany({})
        res.send('delete all user success!')
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

module.exports = route