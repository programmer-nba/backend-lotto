// import database
const Lotto = require("../models/Products/lotto.model.js")
const Seller = require("../models/UsersModel/SellersModel.js")
const User = require('../models/UsersModel/UsersModel.js')
const Admin = require('../models/UsersModel/AdminModel.js')

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
    try{
        const {username , password} = req.body
        
        const admin = await Admin.findOne({username:username})

        if(!admin){
            return res.status(404).send('ไม่พบผู้ใช้นี้ กรุณาลองใหม่อีกครั้ง')
        }

        if(admin && password !== admin.password){
            return res.status(404).send(`รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง`)
        } 
            
        // admin logged in successfully then genarate token
        const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role }, 'your-secret-key', { expiresIn: '1h' })

        return res.status(200).send({token, id:admin._id, role:admin.role})
        
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
    console.log(id)
    const userRole = req.user.role

    try{
        
        if(userRole!=='admin'){
            return res.send('ขออภัย คุณไม่ได้รับอณุญาติให้เข้าถึงข้อมูลนี้')
        } 

        const seller = await Seller.findByIdAndUpdate(id, {status:status})

        if(status === 'แก้ไข'){
            return res.send({
                message:`${seller.name} อัพเดทสถานะเป็น "แก้ไข" เรียบร้อย`,
                id: seller._id,
                role: seller.role,
                seller_role: seller.seller_role,
                success: true
            })
        } else if(status === 'อนุมัติ'){
            return res.send({
                message:`${seller.name} อัพเดทสถานะเป็น "อนุมัติ" เรียบร้อย`,
                id: seller._id,
                role: seller.role,
                seller_role: seller.seller_role,
                success: true
            })
        }
        else {
            return res.send({
                message:`${seller.name} อัพเดทสถานะเป็น "กำลังตรวจสอบ" เรียบร้อย`,
                id: seller._id,
                role: seller.role,
                seller_role: seller.seller_role,
                success: true
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
        await Lotto.deleteMany({})

        res.send({
            message : 'delete all sellers and all lottos success!',
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

exports.register = async (req, res) => {
    try{
        const {username, password} = req.body

        const adminExist = await Admin.findOne({username:username})

        if(adminExist){
            return res.send('มี username นี้แล้ว กรุณาลองใหม่')
        }

        const newAdmin = new Admin({
            username: username,
            password: password,
            role: 'admin'
        })

        const savedAdmin = newAdmin.save() 
        if(!savedAdmin){
            return res.send('ไม่สามารถสร้างผู้ใช้ใหม่ได้')
        }

        return res.status(200).send({
            message: "สร้าง admin สำเร็จ",
            success: true
        })

    }
    catch(error){
        res.status(500).send(`ERROR: ${error.message}`)
        console.log(error.message)
    }
}