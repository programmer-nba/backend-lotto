// add lotteries to store

const express = require('express')
const route = express.Router()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const Seller = require('../../../models/UsersModel/SellersModel.js')

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

// routes
route.put('/addlotto', verifyToken, async (req, res)=>{

    // verify token
    const token = req.header("token")
    const decoded = jwt.verify(token, "your-secret-key")
    const userId = decoded.id
    const userRole = decoded.role
    const userStatus = decoded.status

    // request from client
    const { 
        cost,
        price,
        numbers,
        type,
        title
    } = req.body

    try{
        const day = "16 พฤศจิกายน 2566" // changable >> get from admin controller

        const newLotto = {
            title: title || day,
            day: day,
            numbers: numbers,
            cost: cost,
            price: price,
            profit: price-cost,
            type: type,
            count: numbers.length
        }

        const seller = await Seller.findByIdAndUpdate(userId, {
            $push: { stores: newLotto }
        })

        if(!seller){
            res.send('ไม่พบข้อมูลผู้ใช้งานนี้')
        }

        if(userStatus !== 'confirm'){
            res.send('บัญชีของคุณยังไม่ผ่านการอนุมัติจากแอดมิน')
        } else {
            res.send("เพิ่มหวยชุดใหม่สมบูรณ์")
        }

    }
    catch(error){
        console.log(error.message)
        res.status(500).send(error.message)
    }
})


module.exports = route