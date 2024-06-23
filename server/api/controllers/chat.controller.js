// import database
const Chat = require('../models/Orders/Chat.model.js')
const Order = require('../models/Orders/Order.model.js')
const User = require('../models/UsersModel/UsersModel.js')
const Seller = require('../models/UsersModel/SellersModel.js')

exports.createChat = async (req, res) => {
    const { seller_id, buyer_id, buyer_role } = req.body
    try {

        const seller = await Seller.findById(seller_id)
        if (!seller) {
            return res.status(404).json({
                message: 'ไม่พบ seller นี้ในระบบ',
                success: false,
            })
        }

        let buyer = null

        if (buyer_role === 'user') {
            const searchBuyerInUser = await User.findById(buyer_id)
            if (!searchBuyerInUser) {
                return res.status(404).json({
                    message: 'ไม่พบ user นี้ในระบบ',
                    success: false,
                })
            }
            buyer = searchBuyerInUser
        }

        if (buyer_role === 'seller') {
            const searchBuyerInSeller = await Seller.findById(buyer_id)
            if (!searchBuyerInSeller) {
                return res.status(404).json({
                    message: 'ไม่พบ seller นี้ในระบบ',
                    success: false,
                })
            }
            buyer = searchBuyerInSeller
        }

        const chat = new Chat({
            messages: [],
            members: [
                {
                    id: seller._id || seller_id,
                    name: seller.name,
                    role: seller.role,
                    srole: seller.seller_role,
                    img: seller.shop_img,
                    //phone: order.seller.shop_number
                },
                {
                    id: buyer._id || buyer_id,
                    name: buyer.name,
                    role: buyer.role,
                    srole: buyer.seller_role,
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

exports.getChat = async (req, res) => {
    const { seller_id, buyer_id } = req.params;
    try {
    const chat = await Chat.findOne({
        $and: [
            { 'members.id': seller_id },
            { 'members.id': buyer_id }
        ]
    });

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found."
        });
    }

    return res.status(200).json({
        message: "Chat found successfully.",
        chat: chat
    })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: err.message,
            err: err
        });
    }
}

exports.getChats = async (req, res) => {
    const { id } = req.params;
    try {
    const chat = await Chat.find({
        'members.id': id
    });

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found."
        });
    }

    return res.status(200).json({
        message: "Chat found successfully.",
        chat: chat
    })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: err.message,
            err: err
        });
    }
}

exports.sendMessage = async (req, res) => {
    const { id } = req.params // chat_id
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

        return res.status(201).json({
            message: newMessage
        })

    }
    catch (error) {
        return res.status(500).send({
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
            messages: chat.messages,
        })
    }
    catch (error) {
        res.status(500).send({
            message: error.message || 'Some error occurred while creating the chat.'
        })
    }
}

exports.deleteMessage = async (req, res) => {
    const {id} = req.params // chat _id
    try {
        const chat = await Chat.findByIdAndDelete(id)
        if(!chat){
            return res.status(404).send({
                message: 'Chat not found with this id'
            })
        }
        return res.send({
            messages: 'ลบรายการเรียบร้อย',
            success: true
        })
    }
    catch (error) {
        res.status(500).send({
            message: error.message || 'Some error occurred while creating the chat.'
        })
    }
}