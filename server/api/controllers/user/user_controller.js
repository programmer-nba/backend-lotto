const Client = require("../../models/user/client_model")
const bcrypt = require("bcrypt")

exports.createClient = async (req, res) => {
    const {
        username,
        password,
        displayName,
        email,
        address,
        phone,
        lineId,
        facebookId,
        prefixName,
        firstName,
        lastName,
    } = req.body
    try {
        if (
            !username || !password || !firstName || !lastName
        ) {
            return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" })
        }

        const existClient = await Client.findOne({ $or: [
            { username: username },
            { email: email },
            { displayName: displayName },
            { phone: phone },
            { facebookId: facebookId },
            { lineId: lineId }
        ]})
        if (existClient) {
            if (existClient.username === username) {
                return res.status(400).json({ message: "มี username นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'username' })
            } else if (existClient.email && existClient.email === email) {
                return res.status(400).json({ message: "มี email นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'email' })
            } else if (existClient.displayName && existClient.displayName.trim() === displayName.trim()) {
                return res.status(400).json({ message: "มี displayName นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'displayName' })
            } else if (existClient.phone && existClient.phone === phone) {
                return res.status(400).json({ message: "มี เบอร์โทรรศัพท์ นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'phone' })
            } else if (existClient.facebookId && existClient.facebookId === facebookId) {
                return res.status(400).json({ message: "มี facebookId นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'facebookId' })
            } else if (existClient.lineId && existClient.lineId === lineId) {
                return res.status(400).json({ message: "มี lineId นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'lineId' })
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const newClient = new Client({
            username: username,
            password: hashedPassword,
            displayName: displayName,
            email: email,
            address: address,
            phone : phone,
            lineId: lineId,
            facebookId: facebookId,
            prefixName: prefixName,
            firstName: firstName,
            lastName: lastName,
        })

        await newClient.save()
        return res.status(200).json({
            message: "success!",
            status: true
        })

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.updateClient = async (req, res) => {
    const {
        displayName,
        email,
        address,
        phone,
        lineId,
        facebookId,
        prefixName,
        firstName,
        lastName,
        approveRefs,
        active
    } = req.body

    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: "Invalid id" })
        }

        const existClient = await Client.findOne({ $or: [
            { email: email },
            { displayName: displayName },
            { phone: phone },
            { facebookId: facebookId },
            { lineId: lineId }
        ]})
        if (existClient) {
            if (existClient.email && existClient.email === email) {
                return res.status(400).json({ message: "มี email นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'email' })
            } else if (existClient.displayName && existClient.displayName.trim() === displayName.trim()) {
                return res.status(400).json({ message: "มี displayName นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'displayName' })
            } else if (existClient.phone && existClient.phone === phone) {
                return res.status(400).json({ message: "มี เบอร์โทรรศัพท์ นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'phone' })
            } else if (existClient.facebookId && existClient.facebookId === facebookId) {
                return res.status(400).json({ message: "มี facebookId นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'facebookId' })
            } else if (existClient.lineId && existClient.lineId === lineId) {
                return res.status(400).json({ message: "มี lineId นี้แล้ว กรุณาลองใหม่อีกครั้ง", duplicated: 'lineId' })
            }
        }

        const client = await Client.findById(id)
        if (!client) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งานนี้ในระบบ" })
        }

        await Client.findByIdAndUpdate( id, {
            $set:{
                username: username,
                password: hashedPassword,
                displayName: displayName,
                email: email,
                address: address,
                phone : phone,
                lineId: lineId,
                facebookId: facebookId,
                prefixName: prefixName,
                firstName: firstName,
                lastName: lastName,
                approveRefs: approveRefs,
                active: active,
            }
        }, { new: true })

        return res.status(201).json({
            message: "success!",
            status: true
        })

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getClient = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: "Invalid id" })
        }

        const client = await Client.findById(id).select('-__v -password')

        if (!client) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งานนี้ในระบบ" })
        }

        return res.status(200).json({
            message: "success!",
            status: true,
            data: client
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find().select('-__v -password')

        return res.status(200).json({
            message: "success!",
            status: true,
            length: clients.length,
            data: clients
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.deleteClient = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: "Invalid id" })
        }

        const client = await Client.findById(id)

        if (!client) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งานนี้ในระบบ" })
        }

        await Client.findByIdAndDelete(id)

        return res.status(200).json({
            message: "success!",
            status: true,
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}