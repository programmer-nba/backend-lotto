const Notify = require('../models/Orders/Notify.model')
const Seller = require('../models/UsersModel/SellersModel')
const User = require('../models/UsersModel/UsersModel')

exports.newNotify = async (data) => {
    const { to, from, detail, title, icon, notify_type } = data
    try {
        const newNotify = await Notify.create({
            notify_type: notify_type,
            to: to, // user _id
            title: title,
            detail: detail,
            from: from, // sender name
            icon: icon, // sender image
        })
        if (!newNotify) {
            console.log('can not create new notify')
            return false
        }
        return newNotify
    } 
    catch(err) {
        console.log(err)
        return false
    }
}

exports.getNotifies = async (req, res) => {
    const userId = req.user.id
    try {
        const notifies = await Notify.find()
        const userNotifies = notifies.filter(notify => notify.to === userId.toString())
        const unreadNotifies = userNotifies.filter(notify => notify.status === 'unread')
        return res.status(200).json({
            message: `unread = ${unreadNotifies.length}`,
            status: true,
            data: unreadNotifies,
            datas: userNotifies
        })
    } 
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getNotify = async (req, res) => {
    const { id } = req.query
    try {
        if (!id) {
            return res.status(400).json({
                message: 'need id of notify'
            })
        }
        const notify = await Notify.findById(id)
        if (!notify) {
            return res.status(404).json({
                message: 'not found'
            })
        }
        
        return res.status(200).json({
            message: "success",
            status: true,
            data: notify
        })
    } 
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateNotify = async (req, res) => {
    const { id } = req.query
    const { status } = req.body
    try {
        if (!id) {
            return res.status(400).json({
                message: 'need id of notify'
            })
        }
        if (status && status !== 'read' && status !== 'unread') {
            return res.status(400).json({
                message: 'status must be read or unread'
            })
        }
        const notify = await Notify.findByIdAndUpdate(id, {
            $set: {
                status: status
            }
        }, { new : true })
        if (!notify) {
            return res.status(404).json({
                message: 'not found'
            })
        }
        
        return res.status(200).json({
            message: "success",
            status: true,
            data: notify
        })
    } 
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteNotify = async (req, res) => {
    const { id } = req.query
    try {
        if (! req.user) {
            return res.status(401).json({
                message: 'Unauthorized need valid token on headers'
            })
        }
        if (!id) {
            return res.status(400).json({
                message: 'need id of notify'
            })
        }
        const notify = await Notify.deleteOne({ _id: id })
        if (!notify.deletedCount) {
            return res.status(404).json({
                message: 'not found'
            })
        }
        
        return res.status(200).json({
            message: "deleted!",
            status: true,
            data: notify.deletedCount
        })
    } 
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}
