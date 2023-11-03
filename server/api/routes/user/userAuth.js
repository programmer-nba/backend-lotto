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
    const {username, email, password, phoneNumber, lineId} = req.body
    try{
        const userExisting = await User.findOne({$or:[{username}, {email}, {phoneNumber}, {lineId}]})

        if(userExisting){
            res.send('Username or Email already exist, please try another')
        } else {
            const newUser = new User(
                {
                    username, 
                    email, 
                    password, 
                    phoneNumber,
                    lineId,
                    role : 'user'
                }
            )
    
            await newUser.save()
            res.send(newUser)

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
        const {username=null , phoneNumber=null, password , email=null} = req.body 
        let user = null

        if(username!==null){
            user = await User.findOne({username})
        } else if(phoneNumber!==null) {
            user = await User.findOne({phoneNumber})
        } else if(email!==null) {
            user = await User.findOne({email})
        } 
        
        if(user===null){ 
            res.status(404).json({message: `ไม่พบผู้ใช้งานนี้ในระบบ กรุณาลงทะเบียนผู้ใช้ใหม่`}) 
        } else if(user.password !== password){
            res.status(404).json({message: `รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง`})
        } else{
            // user logged in successfully then genarate token
            const token = jwt.sign({ userId: user._id, username: user.username, userRole: user.role }, 'your-secret-key', { expiresIn: '1h' })
            res.status(200).json({message: `ยินดีต้อนรับ คุณ ${user.username}`, token})
        }
            
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
})


module.exports = route