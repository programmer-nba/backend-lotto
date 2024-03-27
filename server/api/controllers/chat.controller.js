// import database
const Chat = require('../models/Orders/Chat.model.js')
const Order = require('../models/Orders/Order.model.js')
const User = require('../models/UsersModel/UsersModel.js')

exports.createChat = async (req, res) => {
    const {id} = req.params
    try {
        const chatExist = await Chat.findOne({orderId:id})
        if(chatExist) {
            return res.status(200).send({
                message: 'Chat already exist',
                chat: chatExist
            })
        }

        const order = await Order.findById(id).populate('seller', 'name shop_name shop_img role seller_role shop_number') //.populate('buyer', 'name shop_name shop_img role seller_role shop_number phone_number')
        if(!order){
            return res.status(404).send({
                message: 'Order not found with this id'
            })
        }

        let seller = null
        let buyer_name = null
        let buyer_role = null
        let buyer_srole = null
        let buyer_phone = null
        const user = await User.findById(order.buyer._id)
        if(user) {
            buyer_name = user.name
            buyer_role = 'user'
            buyer_srole = 'none'
            buyer_phone = user.phone_number
        } else {
            seller = await Order.findById(id).populate('seller', 'name shop_name shop_img role seller_role shop_number').populate('buyer', 'name shop_name role seller_role phone_number')
            buyer_name = seller.buyer.shop_name || seller.buyer.name
            buyer_role = seller.buyer.role
            buyer_srole = seller.buyer.seller_role
            buyer_phone = seller.buyer.phone_number
        }

        const chat = new Chat({
            orderId: id,
            name: order.order_no,
            messages: [],
            members: [
                {
                    id: order.seller._id,
                    name: order.seller.name,
                    role: order.seller.role,
                    srole: order.seller.seller_role,
                    img: order.seller.shop_img,
                    //phone: order.seller.shop_number
                },
                {
                    id: order.buyer._id || user._id,
                    name: buyer_name,
                    role: buyer_role,
                    srole: buyer_srole,
                    //phone: order.transferBy.phone || buyer_phone
                }
            ],
            createAt: Date.now()
        })

        const savedChat = await chat.save()
        if(!savedChat) {
            return res.status(500).send({
                message: 'Could not create chat.'
            })
        }

        return res.send({
            message: 'Chat created successfully.',
            chat: savedChat
        })
    }
    catch (error) {
        res.status(500).send({
            message: error.message || 'Some error occurred while creating the chat.'
        })
    }
}

exports.sendMessage = async (req, res) => {
    const {id} = req.params // chat_id
    const img = req.files
    const {message, sender, date, time} = req.body
    try {
        const newMessage = await Chat.findByIdAndUpdate(id, {
            $push: {
                messages: {
                    sender: sender,
                    message: message,
                    date: date,
                    time: time,
                    img: img
                }
            }
        }, {new:true})
        if(!newMessage){
            return res.status(404).send({
                message: 'Chat not found with this id'
            })
        }

        return res.send({
            message: 'Message sent successfully.',
            message: newMessage
        })
 
    }
    catch (error) {
        res.status(500).send({
            message: error.message || 'Some error occurred while creating the chat.'
        })
    }
}

exports.getMessages = async (req, res) => {
    const {id} = req.params // chat _id
    try {
        const chat = await Chat.findById(id)
        if(!chat){
            return res.status(404).send({
                message: 'Chat not found with this id'
            })
        }

        return res.send({
            id: chat._id,
            messages: chat.messages
        })
    }
    catch (error) {
        res.status(500).send({
            message: error.message || 'Some error occurred while creating the chat.'
        })
    }
}