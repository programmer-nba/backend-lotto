const Notify = require('../models/Orders/Notify.model')
const Seller = require('../models/UsersModel/SellersModel')
const User = require('../models/UsersModel/UsersModel')

exports.newNotify = async (data) => {
    const { to, from, detail, title, icon, notify_type, data_type } = data
    try {
        const newNotify = await Notify.create({
            notify_type: notify_type,
            to: to, // user _id
            title: title,
            detail: detail,
            data_type: data_type,
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
    const user_id = req.query.user_id
    try {
        const notifies = await Notify.find()
        const userNotifies = notifies.filter(notify => notify.to === JSON.parse(user_id))
        const unreadNotifies = userNotifies.filter(notify => notify.status === 1)
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

exports.updateNotify = async (req, res) => {
    const { id } = req.query
    const { status } = req.body
    try {
        if (!id) {
            return res.status(400).json({
                message: 'need id of notify'
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
