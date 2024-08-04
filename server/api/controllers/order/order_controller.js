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
const { LottoWholesale, LottoRetail } = require('../../models/Lotto/lotto_model')
const { RowLottoWholesale, RowLottoRetail } = require('../../models/Lotto/rowLotto_model')
const { DiscountShop } = require('../../models/Orders/discount_model')
const UserAddress = require('../../models/user/userAddress_model')

const dayjs = require('dayjs')
require("dayjs/locale/th")
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra)
dayjs.locale("th")

const generateCode = (prefix, count) => {
    const date = dayjs(new Date()).format("BBMM")
    const padCount = count.toString().padStart(3, '0')

    return `${prefix}${date}${padCount}`
}

exports.createOrderWholesale = async (req, res) => {
    const { user, userAddress, vatPercent, items, discount, shop, transferBy, transferPrice, deliveryMethod } = req.body
    try {

        let status = 'pending'
        let totalPrice = parseFloat(transferPrice) || 0
        let totalDiscount = 0
        let totalVat = 0
        let totalNet = 0
        let vat = vatPercent || 0

        const [lottoSet, lottoRow, discounted, orderLength] = await Promise.all([
            LottoWholesale.find({ _id: {$in: items} }),
            RowLottoWholesale.find({ _id: {$in: items} }),
            DiscountShop.findById(discount),
            OrderWholesaleCount.find()
        ])

        const prefix = 'LW'
        const count = orderLength.length + 1
        const code = generateCode(prefix, count)

        if (lottoSet.length) {
            const lottoSetTotalPriceList = lottoSet.map(lotto => lotto.price)
            const lottoSetTotalPrice = lottoSetTotalPriceList.reduce((a, b) => a + b, 0)
            totalPrice += lottoSetTotalPrice || 0
        }

        if (lottoRow.length) {
            const lottoRowTotalPriceList = lottoSet.map(lotto => lotto.price)
            const lottoRowTotalPrice = lottoRowTotalPriceList.reduce((a, b) => a + b, 0)
            totalPrice += lottoRowTotalPrice || 0
        }

        if (discounted) {
            totalDiscount = discounted.amount || 0
            totalVat = ((totalPrice - totalDiscount) * vatPercent) * 0.01
        } else {
            totalDiscount = 0
            totalVat = (totalPrice * vat) * 0.01
        }

        totalNet = totalPrice - totalDiscount + totalVat

        const order = new OrderWholesale({
            code: code,
            user: user,
            userAddress: userAddress,
            vatPercent: vat,
            totalPrice: totalPrice,
            totalDiscount: totalDiscount,
            totalVat: totalVat,
            totalNet: totalNet,
            items: items,
            discount: discount,
            status: status,
            shop: shop,
            transferBy: transferBy,
            transferPrice: transferPrice,
            deliveryMethod: deliveryMethod
        })
        const savedOrder = await order.save()
        if (!savedOrder) {
            return res.status(500).json({
                message: 'can not save order!',
            })
        }

        const savedLog = await createOrderWholesaleLog({
            order: savedOrder._id, 
            status: status, 
            user: user, 
            shop: shop
        })

        const savedCount = await createOrderWholesaleCount(savedOrder._id)
        if (!savedCount) {
            return res.status(500).json({
                message: 'can not save count!',
            })
        }

        return res.status(200).json({
            message: 'create order SUCCESS!',
            status: true,
            data: savedOrder,
            log: savedLog ? 'saved' : 'error',
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateOrderWholesale = async (req, res) => {
    const { id, userAddress, vatPercent, items, discount, transferBy, transferPrice, deliveryMethod } = req.body
    try {
        if (!id) {
            return res.status(400).json({
                message: 'no id found',
            })
        }
        if (!items) {
            return res.status(400).json({
                message: 'no items found',
            })
        }
        const oldOrder = await OrderWholesale.findById(id)
        if (!oldOrder) {
            return res.status(404).json({
                message: 'no order found',
            })
        }

        let totalPrice = parseFloat(transferPrice) || 0
        let totalDiscount = oldOrder.totalDiscount
        let totalVat = oldOrder.totalVat
        let totalNet = oldOrder.totalNet
        let vat = vatPercent || oldOrder.vatPercent
        let currentItems = items && items?.length ? items : oldOrder.items

        const [lottoSet, lottoRow, discounted] = await Promise.all([
            LottoWholesale.find({ _id: {$in: currentItems} }),
            RowLottoWholesale.find({ _id: {$in: currentItems} }),
            DiscountShop.findById(discount),
        ])

        if (lottoSet.length) {
            const lottoSetTotalPriceList = lottoSet.map(lotto => lotto.price)
            const lottoSetTotalPrice = lottoSetTotalPriceList.reduce((a, b) => a + b, 0)
            totalPrice += lottoSetTotalPrice || 0
        }

        if (lottoRow.length) {
            const lottoRowTotalPriceList = lottoSet.map(lotto => lotto.price)
            const lottoRowTotalPrice = lottoRowTotalPriceList.reduce((a, b) => a + b, 0)
            totalPrice += lottoRowTotalPrice || 0
        }

        if (discounted) {
            totalDiscount = discounted.amount || 0
            totalVat = ((totalPrice - totalDiscount) * vat) * 0.01
        } else {
            totalDiscount = 0
            totalVat = (totalPrice * vat) * 0.01
        }

        totalNet = totalPrice - totalDiscount + totalVat

        const order = await OrderWholesale.findByIdAndUpdate( id, {
            userAddress: userAddress,
            vatPercent: vat,
            totalPrice: totalPrice,
            totalDiscount: totalDiscount,
            totalVat: totalVat,
            totalNet: totalNet,
            items: currentItems,
            discount: discount || oldOrder.discount,
            transferBy: transferBy || oldOrder.transferBy, 
            transferPrice: transferPrice || oldOrder.transferPrice, 
            deliveryMethod: deliveryMethod || oldOrder.deliveryMethod
        }, { new: true } )
        
        if (!order) {
            return res.status(500).json({
                message: 'can not save order!',
            })
        }

        const savedLog = await createOrderWholesaleLog({
            order: order._id, 
            status: order.status, 
            user: order.user, 
            shop: order.shop
        })

        return res.status(200).json({
            message: 'update order SUCCESS!',
            status: true,
            data: order,
            log: savedLog ? 'saved' : 'error',
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.checkoutOrderWholesale = async (req, res) => {
    const { vatPercent, items, discount } = req.body
    try {

        let totalPrice = 0
        let totalDiscount = 0
        let totalVat = 0
        let totalNet = 0

        if (!vatPercent) {
            vatPercent = 0
        }

        const [lottoSet, lottoRow, discounted] = await Promise.all([
            LottoWholesale.find({ _id: {$in: items} }),
            RowLottoWholesale.find({ _id: {$in: items} }),
            DiscountShop.findById(discount),
        ])

        if (lottoSet.length) {
            const lottoSetTotalPriceList = lottoSet.map(lotto => lotto.price)
            const lottoSetTotalPrice = lottoSetTotalPriceList.reduce((a, b) => a + b, 0)
            totalPrice += lottoSetTotalPrice || 0
        }

        if (lottoRow.length) {
            const lottoRowTotalPriceList = lottoSet.map(lotto => lotto.price)
            const lottoRowTotalPrice = lottoRowTotalPriceList.reduce((a, b) => a + b, 0)
            totalPrice += lottoRowTotalPrice || 0
        }

        if (discounted) {
            totalDiscount = discounted.amount || 0
            totalVat = ((totalPrice - totalDiscount) * vatPercent) * 0.01
        } else {
            totalDiscount = 0
            totalVat = (totalPrice * vatPercent) * 0.01
        }

        totalNet = totalPrice - totalDiscount + totalVat

        const order = {
            vatPercent: vatPercent,
            totalPrice: totalPrice,
            totalDiscount: totalDiscount,
            totalVat: totalVat,
            totalNet: totalNet,
            items: items,
            discount: discount
        }

        return res.status(200).json({
            message: 'SUCCESS!',
            status: true,
            data: order
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateStatusOrderWholesale = async (req, res) => {
    const { id, status } = req.body
    try {
        const order = await OrderWholesale.findByIdAndUpdate(id, {status: status})
        if (!order) {
            return res.status(404).json({
                message: 'no order found',
            })
        }

        const savedLog = await createOrderWholesaleLog({
            order: order._id, 
            status: status, 
            user: order.user, 
            shop: order.shop
        })

        return res.status(200).json({
            message: 'update status success',
            status: true,
            log: savedLog ? 'saved' : 'error',
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

const createOrderWholesaleLog = async({order, status, user, shop}) => {
    try {
        const log = new OrderWholesaleLog({
            order: order,
            status: status,
            user: user,
            shop: shop
        })
        const savedLog = await log.save()
        if (!savedLog) {
            return false
        }
        return true
    }
    catch(err) {
        console.log(err)
        return false
    }
}

const createOrderWholesaleCount = async (order) => {
    try {
        const count = new OrderWholesaleCount({order: order})
        const savedCount = await count.save()
        if (!savedCount) {
            return false
        }
        return true
    }
    catch(err) {
        console.log(err)
        return false
    }
}

exports.getOrdersWholesale = async (req, res) => {
    const { status, user, shop } = req.query
    try {
        let query = {}

        if (status) { query.status = status }
        if (user) { query.user = user }
        if (shop) { query.shop = shop }
        
        const orders = await OrderWholesale.find(query).select('-__v')

        if (!orders.length) {
            return res.status(200).json({
                message: 'no order',
                status: true,
                data: []
            })
        }

        let formattedOrders = []

        const promiseOrders = orders.map(async order => {
            const clientAddress = order.userAddress?.length > 23 ? await UserAddress.findOne({ _id: order.userAddress}) : null
            const shopOrder = await Shop.findById(order.shop)
            const formattedOrder = {
                ...order._doc,
                _userAddress: clientAddress || {},
                shopName: shopOrder?.name || ""
            }
            formattedOrders.push(formattedOrder)
        })
        await Promise.all(promiseOrders)
        
        return res.status(200).json({
            message: `have ${formattedOrders.length} orders`,
            status: true,
            amount: formattedOrders.length,
            data: formattedOrders
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getOrderWholesale = async (req, res) => {
    const { id } = req.params
    try {
        const order = await OrderWholesale.findById(id)

        if (!order) {
            return res.status(404).json({
                message: 'no order found',
            })
        }

        const clientAddress = await UserAddress.findById(order.userAddress)
        const formattedOrder = {
            ...order._doc,
            _userAddress: clientAddress || {}
        }
        
        return res.status(200).json({
            message: `success`,
            status: true,
            data: formattedOrder
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteOrderWholesale = async (req, res) => {
    const { id } = req.params
    try {
        const order = await OrderWholesale.findByIdAndDelete(id)
        if (!order) {
            return res.status(404).json({
                message: 'no order found',
            })
        }
        
        return res.status(200).json({
            message: `delete success`,
            status: true,
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}