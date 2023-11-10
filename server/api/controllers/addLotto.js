// add lotteries to store

const express = require('express')
const route = express.Router()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const Lotto = require('../models/Lotteries/lotto.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')


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
route.post('/addlotto', verifyToken, )


module.exports = route