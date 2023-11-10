// import database
const User = require('../models/UsersModel/UsersModel.js')
const Seller = require('../models/UsersModel/SellersModel.js')

// use .env
const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// get me by token id
exports.getMe = async (req, res)=>{

    const userId = req.user.id
    const userRole = req.user.role

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
}

// get me admin
exports.getMeAdmin = async (req, res)=>{
    res.send({
        name: "admin",
        username: "admin",
        password: "191919",
        role: "admin"
    })
}
