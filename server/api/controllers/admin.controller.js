// import database
const Lotto = require("../models/Lotteries/lotto.model.js")
const Seller = require("../models/UsersModel/SellersModel.js")
const User = require('../models/UsersModel/UsersModel.js')

const jwt = require('jsonwebtoken')

// use .env
const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../..', '.env') })

// Delete All lotteries from database
exports.deleteAllLottos = async (req, res) => {
    try{
        const userRole = req.user.role
        if(userRole !== 'admin'){
            res.send({message:"คุณไม่ใช่ admin ไม่สามารถทำรายการได้"})
        }

        await Lotto.deleteMany()
        const lottosAmount = await Lotto.find()
        
        if(lottosAmount.length > 0){
            res.send({message: "เกิดข้อผิดพลาด ไม่สามารถลบฉลากได้"})
        }

        res.send({
            message: "ลบฉลากทั้งหมดแล้ว",
            amout: `ฉลากในระบบเหลือ ${lottosAmount.length}`
        })
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({message:"ERROR! please check console"})
    }
}

// get all lotteries from database
exports.getAllLottos = async (req, res)=>{
    try{
        // check token is verified
        if(!req.user){
            res.send({message:'verify token error', success:false})
        }

        const lotteries = await Lotto.find()

        // check founded lottery in database
        if(!lotteries){
            res.send({message:"ไม่พบฉลากในระบบ", success: false})
        } else if(lotteries.length <= 0){
            res.send({message:"ไม่มีฉลากในระบบ กรุณารอผู้ขายเพิ่มฉลากใหม่", success: true})
        }

        

        res.send({
            message: `มีฉลากในระบบจำนวน ${lotteries.length} ชุด`,
            success: true,
            data: lotteries
        })

    }
    catch(error){
        console.log(error.message)
        res.status(500).send({
            message: "ERROR, please check console",
            success: false,
        })
    }
}

// Login admin
exports.login = async (req, res)=>{

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
}

// get all sellers
exports.getAllSellers = async (req, res)=>{

    const userRole = req.user.role

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
}

// get all users
exports.getAllUsers = async (req, res)=>{

    const userRole = req.user.role

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
}

// update an seller status
exports.editSellerStatus = async (req, res)=>{

    const {status} = req.body
    const {id} = req.params
    const userRole = req.user.role

    try{
        
        if(userRole!=='admin'){
            res.send('ขออภัย คุณไม่ได้รับอณุญาติให้เข้าถึงข้อมูลนี้')
        } 

        const seller = await Seller.findByIdAndUpdate(id, {status:status})

        if(status === 'ยกเลิก'){
            res.send({
                message:`${seller.name} อัพเดทสถานะเป็น "ยกเลิก" เรียบร้อย`,
                id: seller._id,
                role: seller.role,
                seller_role: seller.seller_role
            })
        } else {
            res.send({
                message:`${seller.name} อัพเดทสถานะเป็น "อนุมัติ" เรียบร้อย`,
                id: seller._id,
                role: seller.role,
                seller_role: seller.seller_role
            })
        }
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
}

// delete all sellers from database
exports.deleteAllSellers = async (req, res)=>{
    try{
        const userRole = req.user.role

        if(userRole !== 'admin'){
            res.send("ขออภัยคุณไม่ใช่ admin ไม่สามารถทำรายการนี้ได้")
        }
        await Seller.deleteMany({})
        res.send({
            message : 'delete seller success!',
            success : true
        })
    }
    catch(err){
        res.send({
            message : 'please check console',
            success : false
        })
        console.log({ERROR:err.message})
    }
}

// delete all users from database
exports.deleteAllUsers = async (req, res)=>{
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
}