const {
    OrderWholesale, 
    OrderWholesaleCount, 
    OrderWholesaleLog, 
    OrderRetail, 
    OrderRetailCount, 
    OrderRetailLog
} = require('../../models/Orders/order_model')
const Shop = require('../../models/user/shop_model')
const Client = require('../../models/user/client_model')
const { ObjectId } = require('mongoose').Types;

exports.getIncome = async (req, res) => {
    const { shop_id } = req.params;
    try {
        const paidOrders = await OrderWholesale.aggregate([
            { 
                $match: { 
                    $and: [
                        { shop: new ObjectId(shop_id) },
                        { $or: [{ status: 3 }, { status: 11 }] }
                    ]
                }
            },
            { 
                $group: {
                    _id: null, 
                    total: { $sum: "$totalNet" },
                    count: { $sum: 1 }
                } 
            }
        ]);

        return res.status(200).json({
            message: "success",
            code: 200,
            data: paidOrders?.length ? paidOrders[0] : {}
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error",
            code: 500
        });
    }
};