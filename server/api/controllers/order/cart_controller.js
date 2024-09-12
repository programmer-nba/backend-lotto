// models
const { Cart, ExpireCartTime } = require('../../models/Orders/cart_model')
const { CartRow, ExpireCartRowTime } = require('../../models/Orders/cartrow_model')

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

exports.getItemsInCart = async (req, res) => {
    try {
        const carts = await Cart.find()

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


exports.addToCartRow = async (req, res) => {
    const { user_id, item_id } = req.body
    try {
        if (!user_id || !item_id) {
            return res.status(400).json({
                message: 'user_id and item_id are required',
            })
        }

        const existItemInCart = await CartRow.findOne({ item_id: item_id })
        if (existItemInCart) {
            return res.status(400).json({
                message: 'item already in cart',
            })
        }

        const expireCartRowTime = await ExpireCartRowTime.findOne()
        let  expireMinute = 15
        if (expireCartRowTime) {
            expireMinute = expireCartRowTime.minute
        }
       
        const expire = dayjs().add(expireMinute, 'minute').toDate()
        const newCartRow = new CartRow({
            user_id,
            item_id,
            expire
        })
        await newCartRow.save()
        return res.status(200).json({
            message: 'success',
            status: true,
            data: newCartRow
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteItemInCartRow = async (req, res) => {
    const { item_id } = req.params
    try {
        if (!item_id) {
            return res.status(400).json({
                message: 'item_id not found'
            })
        }
       
        const removedCart = await CartRow.findOneAndDelete({ item_id: item_id })

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

exports.deleteItemsInCartRow = async (req, res) => {
    const { user_id } = req.params
    try {
        if (!user_id) {
            return res.status(400).json({
                message: 'user_id not found'
            })
        }
       
        const removedCarts = await CartRow.deleteMany({ user_id: user_id })

        return res.status(200).json({
            message: `delete ${removedCarts.deletedCount} items in cart row success`,
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

exports.getUserItemsInCartRow = async (req, res) => {
    const { user_id } = req.params
    try {
        if (!user_id) {
            return res.status(400).json({
                message: 'user_id not found'
            })
        }
       
        const carts = await CartRow.find({ user_id: user_id })

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

exports.getItemsInCartRow = async (req, res) => {
    try {
        const carts = await CartRow.find()

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