// import database
const Lotto = require("../models/Products/lotto.model.js")
const Seller = require("../models/UsersModel/SellersModel.js")
const User = require('../models/UsersModel/UsersModel.js')
const Admin = require('../models/UsersModel/AdminModel.js')
const Day = require('../models/Config/Day_model.js')
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
            return res.send({message:"คุณไม่ใช่ admin ไม่สามารถทำรายการได้"})
        }

        await Lotto.deleteMany()
        const lottosAmount = await Lotto.find()
        
        if(lottosAmount.length > 0){
            return res.send({message: "เกิดข้อผิดพลาด ไม่สามารถลบฉลากได้"})
        }

        return res.send({
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
            return res.send({message:'verify token error', success:false})
        }

        const lotteries = await Lotto.find()

        // check founded lottery in database
        if(!lotteries){
            return res.send({message:"ไม่พบฉลากในระบบ", success: false})
        } else if(lotteries.length <= 0){
            return res.send({message:"ไม่มีฉลากในระบบ กรุณารอผู้ขายเพิ่มฉลากใหม่", success: true})
        }

        

        return res.send({
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
        const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role, super: admin.super }, 'your-secret-key', { expiresIn: '6h' })

        return res.status(200).send({token, id:admin._id, role:admin.role, super:admin.super})
        
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
}

// get all sellers
exports.getAllSellers = async (req, res)=>{

    //const userRole = req.user.role

    try{

        
            const sellers = await Seller.find()
            res.send(sellers)
        
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

// get an seller status
exports.getSeller = async (req, res)=>{

    const {id} = req.params
    const userRole = req.user.role

    try{
        
        if(userRole!=='admin'){
            return res.send('ขออภัย คุณไม่ได้รับอณุญาติให้เข้าถึงข้อมูลนี้')
        } 

        const seller = await Seller.findById(id)
        if(!seller) {
            return res.send('seller id not found')
        }

        return res.send({
            seller: seller,
            success: true
        })
        
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
        const {username, password, superadmin} = req.body

        const adminExist = await Admin.findOne({username:username})

        if(adminExist){
            return res.send('มี username นี้แล้ว กรุณาลองใหม่')
        }

        const newAdmin = new Admin({
            username: username,
            password: password,
            role: 'admin',
            super: superadmin || false
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

exports.deleteAdmin = async (req, res) => {
    try{
        const userSuper = req.user.super
        const {id} = req.params

        if(userSuper===false){
            return res.send('ไม่สามารถทำรายการนี้ได้ กรุณาเข้าสู่ระบบเป็น super-ADMIN')
        }

        const deletedAdmin = await Admin.findByIdAndDelete(id)
        if(!deletedAdmin){
            return res.status(404).send('ไม่พบ admin นี้ในระบบ กรุณาลองใหม่')
        }

        return res.send(`ลบ admin ชื่อ : ${deletedAdmin.username} เรียบร้อย`)
    }
    catch(error){

    }
}

// get all admins 
exports.getAllAdmin = async (req, res) => {
    try{
        const userSuper = req.user.super
        if(!userSuper){
            return res.send('you can not access this function! super-admin only')
        }

        const admins = await Admin.find({role:'admin'})
        if(admins.length <= 1){
            return res.send('no any other admin role, please create one')
        }

        return res.send({
            message: `success! have -${admins.length}- admins in system`,
            admins: admins,
            success: true
        })

    }
    catch(error){
        res.send('ERROR')
        console.log(error.message)
    }
}

exports.deleteSeller = async (req, res) => {
    try{
        const {id} = req.params
        const deletedSeller = await Seller.findByIdAndDelete(id)
        if(!deletedSeller){
            res.send('seller not found')
        }

        res.send('delete seller success!')
    }
    catch(error){
        res.send('ERROR!')
        console.log(error)
    }
}

exports.createConfigDate = async (req, res) => {
    const { close, open, period } = req.body
    try{
        const dayconfig = await Day.create({
            period: { 
                day: period.day,
                month: period.month,
                year: period.year,
                time: period.time,
                date: period.date,
                text: period.text
            },
            close: { 
                day: close.day,
                month: close.month,
                year: close.year,
                time: close.time,
                date: close.date,
                text: close.text,
            },
            open: { 
                day: open.day,
                month: open.month,
                year: open.year,
                time: open.time,
                date: open.date,
                text: open.text,
            },
        })
        if(!dayconfig){
            return res.send('can not create config date')
        }
        return res.json({
            message: "create config date success!",
            data: dayconfig,
            status: true
        })
    }
    catch(error){
        console.log(error)
        return res.send('ERROR!')
    }
}

exports.updateConfig = async (req, res) => {
    try{
        const { id } = req.params
        const { period, close, open, open_wholesale, open_retail } = req.body
        const dayconfig = await Day.findByIdAndUpdate(id, {
            $set: {
                open_wholesale: open_wholesale,
                open_retail: open_retail,
                period: period,
                close: close,
                open: open,
            }
        }, { new: true })
        if(!dayconfig){
            return res.send('day-config not found')
        }

        return res.json({
            message:'update config date success!', 
            data: dayconfig
        })
    }
    catch(error){
        console.log(error)
        return res.send('ERROR!')
    }
}

exports.getConfigDate = async (req, res) => {
    try {
        const dayconfig = await Day.findOne()
        return res.status(200).send({
            message: "success",
            status: true,
            data: dayconfig
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).send('ERROR : can not get config date')
    }
}

exports.deleteConfigDate = async (req, res) => {
    const { id } = req.params
    try {
        const dayconfig = await Day.deleteOne({ _id: id })
        if(dayconfig.deletedCount === 0) {
            return res.status(404).json({
                message: "can not delete config date"
            })
        }
        return res.status(200).send({
            message: "success",
            status: true
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).send('ERROR : can not get config date')
    }
}
