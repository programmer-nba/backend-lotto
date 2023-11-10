// Login & Logout Admin
const admins = require('../../controllers/admin.controller.js')
const express = require('express')
//const Admin = require('../../models/UsersModel/AdminModel.js')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

// use .env
const dotenv = require('dotenv')
const path = require('path')
const verifyToken = require('../../middleware/verifyToken.js')

dotenv.config({ path: path.resolve(__dirname, '../..', '.env') })

const route = express.Router()

route.use(bodyParser.urlencoded({extended: true}))
route.use(bodyParser.json())

// [Login] 
route.post('/login', async (req,res,next)=>{

    const adminEnvString = process.env.ADMIN
    const admin = JSON.parse(adminEnvString)

    try{
        const {username , password} = req.body     
        
        if(username!==admin.username){ 
            res.status(404).json({message: `ไม่พบผู้ใช้งานนี้ กรุณาติดต่อผู้ดูแลระบบ`}) 
        } else if(password !== admin.password){
            res.status(404).json({message: `รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง`})
        } else{
            // admin logged in successfully then genarate token
            const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role }, 'your-secret-key', { expiresIn: '1h' })
            res.status(200).send({token, id:admin._id, role:admin.role})
        }
            
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
})

route.delete('/alllottos', verifyToken, admins.deleteAllLotto)

module.exports = route