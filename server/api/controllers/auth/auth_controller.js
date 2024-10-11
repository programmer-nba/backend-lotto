const Client = require("../../models/user/client_model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.loginClient = async (req, res) => {
    const { username, password } = req.body
    try {
        if (!username || !password) {
            return res.status(400).json({ message: "Invalid username or password" })
        }

        let client = null

        client = await Client.findOne({ username: username })

        if (!client) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งานนี้ในระบบ", invalid: 'username' })
        }

        const hashedPassword = bcrypt.compare(password, client.password)

        if (!hashedPassword) {
            return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง", invalid: 'password' })
        }

        const token = jwt.sign(
            {
                _id: client._id, 
                displayName: client.displayName,
                role: client.role,
                code: client.code
            }, 
            "Lotto$5555"
        )

        /* if (!client.active) {
            return res.status(401).json({ 
                message: "ผู้ใช้งานไม่ได้รับการอนุมัติให้เข้าระบบ กรุณาติดต่อแอดมิน", 
                invalid: 'active',
                user_id: client._id,
                user_role: client.role,
                token: token
            })
        } */

        return res.status(200).json({
            message: "success!",
            status: true,
            token: token,
            data: client
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}