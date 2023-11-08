// Login & Logout user

const express = require('express')
const User = require('../../models/UsersModel/UsersModel.js')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const route = express.Router()

route.use(bodyParser.urlencoded({extended: true}))
route.use(bodyParser.json())

// [Register]
route.post('/register', async (req,res,next)=>{
    const {password, phone_number, name, address, line_id} = req.body
    try{
        if(!password || !phone_number || !name ){
            res.send('กรุณากรอกข้อมูลให้ถูกต้อง')
        } else {
            const userExisting = await User.findOne({phone_number})
            /* const userExisting = false */

            if(userExisting){
                res.send('หมายเลขโทรศัพท์ นี้ มีผู้ใช้งานแล้ว กรุณาลองใหม่อีกครั้ง')
            } else {
                const newUser = new User(
                    {
                        name,
                        password, 
                        phone_number,
                        address,
                        line_id,

                        role : 'user'
                    }
                )
        
                await newUser.save()
                res.send(newUser)
            }
        }
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
})


// [Login] 
route.post('/login', async (req,res,next)=>{
    
    try{
        const {phone_number, password} = req.body 
        let user = {}

        if(phone_number!==undefined) {
            user = await User.findOne({phone_number})
        }  
        
        if(!user){ 
            res.status(404).json({message: `ไม่พบผู้ใช้งานนี้ในระบบ กรุณาลงทะเบียนผู้ใช้ใหม่`}) 
        } else if(user.password !== password){
            res.status(404).json({message: `รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง`})
        } else{
            // user logged in successfully then genarate token
            const token = jwt.sign({ id: user._id, role: user.role }, 'your-secret-key', { expiresIn: '1h' })
            res.status(200).json({token, id:user._id, role:user.role})
        }
            
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
})


module.exports = route