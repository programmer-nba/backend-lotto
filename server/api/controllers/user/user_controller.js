const Client = require("../../models/user/client_model")
const bcrypt = require("bcrypt")
const UserAddress = require('../../models/user/userAddress_model')

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
        role,
        introduce_code
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

        const userLength = await Client.countDocuments()
        const padCode = (userLength + 1).toString().padStart(4, '0')
        const userCodePrefix = 'LT-'

        const code = `${userCodePrefix}${padCode}`

        const roles = ['user', 'admin', 'retail', 'retail_plus', 'wholesale', 'wholesale_plus']
        if (!roles.includes(role)) {
            return res.status(400).json({ message: "role ไม่ถูกต้อง" })
        }

        const maxShop = role === 'user' ? 0 
        : role === 'retail' ? 1
        : role === 'retail_plus' ? 1
        : role === 'wholesale' ? 1
        : role === 'wholesale_plus' ? 5
        : 0

        const newClient = new Client({
            code: code,
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
            role: role,
            maxShop: maxShop,
            active: true,
            introduce_code: introduce_code
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
            } else if (existClient.displayName && existClient.displayName?.trim() === displayName?.trim()) {
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

exports.getClientAddresses = async(req, res) => {
    const { owner } = req.params
    try {
        if (!owner) {
            return res.status(400).json({ message: "Invalid owner" })
        }

        const addresses = await UserAddress.find({ owner: owner })

        return res.status(200).json({
            data: addresses,
            status: true,
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.createClientAddress = async(req, res) => {
    const {
        title,
        owner,
        houseNo,
        province,
        district,
        subDistrict,
        zipcode,
        phone,
        name
    } = req.body
    try {
        if (!owner) {
            return res.status(400).json({ message: "Invalid owner" })
        }

        const address = new UserAddress({
            title: title,
            owner: owner,
            houseNo: houseNo,
            province: province,
            district: district,
            subDistrict: subDistrict,
            zipcode: zipcode,
            fullAddress: `${houseNo} ${subDistrict} ${district} ${province} ${zipcode}`,
            phone: phone,
            name: name
        })

        const savedAddress = await address.save()
        if (!savedAddress) {
            return res.status(500).json({ message: "Server error" })
        }

        return res.status(200).json({
            data: savedAddress,
            status: true,
            message: "success"
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.updateClientAddress = async(req, res) => {
    const {
        title,
        houseNo,
        province,
        district,
        subDistrict,
        zipcode,
        phone,
        name
    } = req.body
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: "Invalid id" })
        }

        const oldAddress = await UserAddress.findById(id)

        const address = await UserAddress.findByIdAndUpdate(id, {
                $set: {
                    title: title || oldAddress.title,
                    houseNo: houseNo || oldAddress.houseNo,
                    province: province,
                    district: district,
                    subDistrict: subDistrict,
                    zipcode: zipcode,
                    fullAddress: `${houseNo || oldAddress.houseNo} ${subDistrict} ${district} ${province} ${zipcode}`,
                    phone: phone || oldAddress.phone,
                    name: name || oldAddress.name
                }
            }, { new: true })

        if (!address) {
            return res.status(500).json({ message: "Server error" })
        }

        return res.status(201).json({
            data: address,
            status: true,
            message: "success"
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.deleteClientAddress = async(req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).json({ message: "Invalid id" })
        }

        const address = await UserAddress.findByIdAndDelete(id)
        if (!address) {
            return res.status(404).json({ message: "Address not found" })
        }

        return res.status(200).json({
            message: "delete success!",
            status: true,
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}