// add lotteries to store

const express = require('express')
const route = express.Router()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const Seller = require('../../../models/UsersModel/SellersModel.js')

route.use(bodyParser.urlencoded({extended: true}))
route.use(bodyParser.json())

// routes
route.put('/addlotto', async (req, res)=>{

    // verify token
    const token = req.header("token")
    const decoded = jwt.verify(token, "your-secret-key")
    const userId = decoded.id

    // request from client
    const {
        period, 
        numbers
    } = req.body

    try{
        const newLotto = {
            period: period,
            numbers: numbers
        }

        const seller = await Seller.findByIdAndUpdate(userId, {
            $push: { stores: newLotto }
        })

        if(!seller){
            res.send('ไม่พบข้อมูลผู้ใช้งานนี้')
        }
        res.send("เพิ่มหวยชุดใหม่สมบูรณ์")
    }
    catch(error){
        console.log(error.message)
        res.status(500).send(error.message)
    }
})


module.exports = route