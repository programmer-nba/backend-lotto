const TransferCost = require('../models/UsersModel/TransferCost_model')

exports.createTransferCost = async (req, res) => {
    try {
        const { name, price, seller_id } = req.body
        /* const role = req.user.role
        if (role !== 'seller') {
            return res.status(401).json({
                message: 'Unauthorize'
            })
        } */
        const transferCost = new TransferCost({
            name: name,
            price: price,
            seller_id: seller_id
        })
        if (!transferCost) {
            return res.status(404).json({
                message: "data not found",
            })
        }
        const savedData = await transferCost.save()

        return res.status(200).json({
            message: "success",
            status: true,
            data: savedData
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateTransferCost = async (req, res) => {
    const { id } = req.params
    const { name, price, active } = req.body
    try {
        /* const role = req.user.role
        if (role !== 'seller') {
            return res.status(401).json({
                message: 'Unauthorize'
            })
        } */
        const transferCost = await TransferCost.findByIdAndUpdate(id, {
            $set: {
                name: name,
                price: price,
                active: active
            }
        }, { new:true })
        if(!transferCost) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(201).json({
            message: "success",
            status: true,
            data: transferCost
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getMyTransferCosts = async (req, res) => {
    const { seller_id } = req.params
    try {
        /* const role = req.user.role
        if (role !== 'seller') {
            return res.status(401).json({
                message: 'Unauthorize'
            })
        } */
        const transferCosts = await TransferCost.find({ seller_id: seller_id })
        return res.status(200).json({
            message: `have ${transferCosts.length} items`,
            status: true,
            data: transferCosts
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getMyTransferCost = async (req, res) => {
    const { id } = req.params
    try {
        /* const role = req.user.role
        if (role !== 'seller') {
            return res.status(401).json({
                message: 'Unauthorize'
            })
        } */
        const transferCost = await TransferCost.findById(id)
        if(!transferCost){
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: transferCost
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteTransferCost = async (req, res) => {
    const { id } = req.params
    try {
        /* const role = req.user.role
        if (role !== 'seller') {
            return res.status(401).json({
                message: 'Unauthorize'
            })
        } */
        const transferCost = await TransferCost.findByIdAndDelete(id)
        if(!transferCost){
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: transferCost.deletedCount
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}