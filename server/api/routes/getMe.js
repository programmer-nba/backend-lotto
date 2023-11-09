const jwt = require('jsonwebtoken')
const express = require('express')
const route = express.Router()

const User = require('../models/UsersModel/UsersModel.js')
const Seller = require('../models/UsersModel/SellersModel.js')

// use .env
const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

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

// get me by token id
route.get('/', verifyToken, async (req,res,next)=>{

    const token = req.header("token")
    const decoded = jwt.verify(token, "your-secret-key")
    const userId = decoded.id
    const userRole = decoded.role

    try{
        
        if(userRole === 'admin'){
            const adminEnvString = process.env.ADMIN
            const admin = JSON.parse(adminEnvString)
            res.send(admin)
        } 
        else if(userRole === 'user') {
            const user = await User.findById(userId)
            if(!user) {
                res.status(404).send('username not found')
            } else {
                res.status(201).send(user)
            }
        } 
        else if(userRole === 'seller') {
            const seller = await Seller.findById(userId)
            if(!seller) {
                res.status(404).send('username not found')
            } else {
                res.status(201).send(seller)
            }
        }

    }

    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

// get me admin
route.get('/admin', (req, res)=>{
    res.send({
        name: "admin",
        username: "admin",
        password: "191919",
        role: "admin"
    })
})

module.exports = route
