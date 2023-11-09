const User = require('../models/UsersModel/UsersModel.js')
const Seller = require('../models/UsersModel/SellersModel.js')
const bodyParser = require('body-parser')
const route = require('express').Router()
const jwt = require('jsonwebtoken')

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

route.use(bodyParser.urlencoded({extended: true}))
route.use(bodyParser.json())

// [Login] user & seller
route.post('/', async (req, res)=>{
    try {
        const { phone_number, password } = req.body;
        let user = null;

        if (phone_number !== undefined) {
            // First, try to find the user in the User collection
            user = await User.findOne({ phone_number });

            if (!user) {
                // If not found in the User collection, try to find in the Seller collection
                user = await Seller.findOne({ phone_number });

                if (!user) {
                    res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้ในระบบ กรุณาลงทะเบียนผู้ใช้ใหม่' });
                } else if (user.password !== password) {
                    res.status(404).json({ message: 'รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง' });
                }
            } else if (user.password !== password) {
                res.status(404).json({ message: 'รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง' });
            }
        } else {
            // If the phone number is not provided in the request, that's an error.
            res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง' });
        }

        if (user) {
            // If a user is found and the password is correct, generate a token
            const token = jwt.sign({ id: user._id, role: user.role }, 'your-secret-key', { expiresIn: '1h' });

            res.status(200).json({
                token,
                id: user._id,
                role: user.role,
                name: user.name,
                success: true,
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
        console.log({ ERROR: err.message });
    }
})

module.exports = route