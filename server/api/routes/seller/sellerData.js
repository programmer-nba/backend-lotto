// CRUD seller data by using ID

const express = require('express')
const Seller = require('../../models/UsersModel/SellersModel.js')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const route = express.Router()

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

// get list of all sellers
route.get('/all', async (req,res,next)=>{
    try{

        const sellers = await Seller.find()
        res.send({data:sellers})
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})


// get an user by id
route.get('/:id', async (req,res,next)=>{
    try{
        const {id} = req.params
        const user = await Seller.findById(id)

        if(!user) {
            res.status(404).send('user not found')
        } 
        res.status(201).send(user)
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

// update an user data
route.put('/:id',  async (req,res,next)=>{
    try{
        const {username, email, password} = req.body
        const {id} = req.params
        const seller = await Seller.findByIdAndUpdate(id, req.body)

        res.send('update user info success!')
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

// delete an user from database (**pending...**)
route.delete('/:id', async (req,res,next)=>{
    try{
        const {id} = req.params
        const user = await Seller.findByIdAndDelete(id)
        res.send('delete user success!')
    }
    catch(err){
        res.send('ERROR : please check console')
        console.log({ERROR:err.message})
    }
})

module.exports = route