// add lotteries to store

const express = require('express')
const route = express.Router()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const Lotto = require('../../../models/Lotteries/lotto.model.js')
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
route.post('/addlotto', verifyToken, async (req, res)=>{
    try{
        // verify token
        const token = req.header("token")
        const decoded = jwt.verify(token, "your-secret-key")
        const userId = decoded.id
        const userRole = decoded.seller_role
        const userStatus = decoded.status

        const {
            number, // หมายเลขฉลาก
            type, // ประเภทหวย
            cost,
            price
        } = req.body

        const seller = await Seller.findById(userId)
        const shopname = seller.shop_name

        const newLotto = 
            {
                seller_id: userId,
                shopname: shopname,
                type: type, // ประเภทฉลาก (หวยเดี่ยว, หวยชุด, หวยกล่อง...)
                number: number, // หมายเลขฉลาก
                amount: number.length,
                period: "16 พฤศจิกายน 2566", // งวดที่ออก
                cost: cost,
                price: price,
                profit: price-cost,
                totlal_profit: (price-cost)*number.length
            }

        const lotto = await Lotto.create(newLotto)

        if(lotto){
            res.send({
                message: "เพิ่มฉลากสมบูรณ์",
                data:lotto,
                success: true,
            })
        }
        else {
            res.send({
                message: 'ไม่สามารถเพิ่มฉลากได้',
                success: false
            })
        }
    }
    catch(error){
        console.log(error.message)
        res.status(500).send(error.message)
    }
})


module.exports = route