// models
const { Cart, ExpireCartTime } = require('../../models/Orders/cart_model')

// dayjs
const dayjs = require('dayjs')
require("dayjs/locale/th")
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra)
dayjs.locale("th")

exports.addToCart = async (req, res) => {
    const { user_id, item_id } = req.body
    try {
        if (!user_id || !item_id) {
            return res.status(400).json({
                message: 'user_id and item_id are required',
            })
        }

        const existItemInCart = await Cart.findOne({ item_id: item_id })
        if (existItemInCart) {
            return res.status(400).json({
                message: 'item already in cart',
            })
        }

        const expireCartTime = await ExpireCartTime.findOne()
        let  expireMinute = 15
        if (expireCartTime) {
            expireMinute = expireCartTime.minute
        }
       
        const expire = dayjs().add(expireMinute, 'minute').toDate()
        const newCart = new Cart({
            user_id,
            item_id,
            expire
        })
        await newCart.save()
        return res.status(200).json({
            message: 'success',
            status: true,
            data: newCart
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteItemInCart = async (req, res) => {
    const { item_id } = req.params
    try {
        if (!item_id) {
            return res.status(400).json({
                message: 'item_id not found'
            })
        }
       
        const removedCart = await Cart.findOneAndDelete({ item_id: item_id })

        if (!removedCart) {
            return res.status(404).json({
                message: 'cart not found'
            })
        }

        return res.status(200).json({
            message: 'delete item in cart success',
            status: true,
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteItemsInCart = async (req, res) => {
    const { user_id } = req.params
    try {
        if (!user_id) {
            return res.status(400).json({
                message: 'user_id not found'
            })
        }
       
        const removedCarts = await Cart.deleteMany({ user_id: user_id })

        return res.status(200).json({
            message: `delete ${removedCarts.deletedCount} items in cart success`,
            status: true,
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getUserItemsInCart = async (req, res) => {
    const { user_id } = req.params
    try {
        if (!user_id) {
            return res.status(400).json({
                message: 'user_id not found'
            })
        }
       
        const carts = await Cart.find({ user_id: user_id })

        return res.status(200).json({
            message: 'success',
            status: true,
            data: carts
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}