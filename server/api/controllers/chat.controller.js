// import database
const Chat = require('../models/Orders/Chat.model.js')
const Order = require('../models/Orders/Order.model.js')
const User = require('../models/UsersModel/UsersModel.js')
const Seller = require('../models/UsersModel/SellersModel.js')

exports.createChat = async (req, res) => {
    const { members } = req.body
    try {
        const chat = new Chat({
            members: members,
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

exports.getUserChats = async (req, res) => {
    const { user_id } = req.params;
    try {
    const chats = await Chat.find({
        members: {
            $elemMatch: {
                $eq: user_id
            }
        },
        status: 1
    });

    if (!chats) {
        return res.status(404).json({
            message: "Chat not found."
        });
    }

    return res.status(200).json({
        message: "Chat found successfully.",
        chat: chats
    })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: err.message,
            err: err
        });
    }
}

exports.endChat = async (req, res) => {
    const { chat_id } = req.params;
    try {
        const chat = await Chat.findById(chat_id);
        if (!chat) {
            return res.status(404).json({
                message: "Chat not found."
            });
        }

        chat.status = 0;
        const savedChat = await chat.save();
        if (!savedChat) {
            return res.status(500).json({
                message: "Could not end chat."
            });
        }

        return res.status(200).json({
            message: "Chat ended successfully.",
            chat: savedChat
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: err.message,
            err: err
        });
    }
}