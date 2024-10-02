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
const File = require('../../models/user/file_model');

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
    const { user, userAddress, vatPercent, items, rowItems, discount_items, discount_id, discount_manual, shop, transferBy, transferPrice, deliveryMethod, remark, payment_method, market } = req.body
    try {

        let status =
        market === 'pos' && parseInt(payment_method) !== 0
        ? 11
        : market === 'pos' && parseInt(payment_method) === 0
        ? 10
        : 1
        let totalPrice = 0
        let totalDiscount = 0
        let totalVat = 0
        let totalNet = 0
        let vat = vatPercent || 0

        const [lottoSet, lottoRow, discounted, orderLength] = await Promise.all([
            LottoWholesale.find({ _id: {$in: items} }),
            RowLottoWholesale.find({ _id: {$in: rowItems} }),
            DiscountShop.findById(discount_id),
            OrderWholesaleCount.find()
        ])

        if (discount_items && discount_items?.length) {
            discount_items.forEach(async x => {
                const matchedItem_index = lottoSet.findIndex(item => item._id == x.lotto_id)
                if (matchedItem_index !== -1) {
                    lottoSet[matchedItem_index].price = x.price
                    await LottoWholesale.findByIdAndUpdate(lottoSet[matchedItem_index]._id, {
                        $set: {
                            price: x.price
                        }
                    })
                }
            })
            discount_items.forEach(async x => {
                const matchedItem_index = lottoRow.findIndex(item => item._id == x.lotto_id)
                if (matchedItem_index !== -1) {
                    lottoRow[matchedItem_index].price = x.price
                    await RowLottoWholesale.findByIdAndUpdate(lottoRow[matchedItem_index]._id, {
                        $set: {
                            price: x.price
                        }
                    })
                }
            })
        }

        const prefix = 'LW'
        const count = orderLength.length + 1
        const code = generateCode(prefix, count)

        let updatedLottoWholesale = 0
        if (lottoSet.length) {
            const lottoSetTotalPriceList = lottoSet.map(lotto => lotto.price)
            const lottoSetTotalPrice = lottoSetTotalPriceList.reduce((a, b) => a + b, 0)
            totalPrice += lottoSetTotalPrice || 0

            await Promise.all(lottoSet.map(async (lt) => {
                let result = await LottoWholesale.findByIdAndUpdate(lt._id, {
                    $set: {
                        status: 2
                    }
                }, { new: true })
                //console.log(result)
                if (result) {
                    updatedLottoWholesale ++
                }
            }))
        }

        let updatedRowLottoWholesale = 0
        if (lottoRow.length) {
            console.log('row', lottoRow.length)
            const lottoRowTotalPriceList = lottoRow.map(lotto => lotto.price)
            const lottoRowTotalPrice = lottoRowTotalPriceList.reduce((a, b) => a + b, 0)
            totalPrice += lottoRowTotalPrice || 0
             
            await Promise.all(lottoRow.map(async (rlt) => {
                let result = await RowLottoWholesale.findByIdAndUpdate(rlt._id, {
                    $set: {
                        status: 2
                    }
                }, { new: true })
                if (result) {
                    updatedRowLottoWholesale ++
                }
            }))
        }

        if (discounted) {
            totalDiscount = (discounted.amount || 0) + (discount_manual || 0)
            totalVat = ((totalPrice - totalDiscount) * vatPercent) * 0.01
        } else {
            totalDiscount = (discount_manual || 0)
            totalVat = (totalPrice * vat) * 0.01
        }

        totalNet = totalPrice - totalDiscount + totalVat + transferPrice

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
            rowItems: rowItems,
            discount: discount_id,
            status: status,
            remark: remark,
            shop: shop,
            payment_method: payment_method,
            transferBy: transferBy,
            transferPrice: transferPrice,
            deliveryMethod: deliveryMethod,
            market: market
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
            updated: `lotto: ${updatedLottoWholesale}, rowLotto: ${updatedRowLottoWholesale}`
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateOrderWholesale = async (req, res) => {
    const { id, userAddress, vatPercent, items, rowItems, discount, transferBy, transferPrice, deliveryMethod, trackingNo } = req.body
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

        let totalPrice = oldOrder.totalPrice
        let totalDiscount = oldOrder.totalDiscount
        let totalVat = oldOrder.totalVat
        let totalNet = oldOrder.totalNet
        let vat = vatPercent || oldOrder.vatPercent
        let currentItems = items && items?.length ? items : oldOrder.items
        let currentRowItems = rowItems && rowItems?.length ? rowItems : oldOrder.rowItems

        const [lottoSet, lottoRow, discounted] = await Promise.all([
            LottoWholesale.find({ _id: {$in: currentItems} }),
            RowLottoWholesale.find({ _id: {$in: currentRowItems} }),
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

        totalNet = totalPrice - totalDiscount + totalVat + transferPrice

        const order = await OrderWholesale.findByIdAndUpdate( id, {
            userAddress: userAddress,
            vatPercent: vat,
            totalPrice: totalPrice,
            totalDiscount: totalDiscount,
            totalVat: totalVat,
            totalNet: totalNet,
            items: currentItems,
            rowItems: currentRowItems,
            discount: discount || oldOrder.discount,
            transferBy: transferBy || oldOrder.transferBy, 
            transferPrice: transferPrice || oldOrder.transferPrice, 
            deliveryMethod: deliveryMethod || oldOrder.deliveryMethod,
            trackingNo: trackingNo || oldOrder.trackingNo
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
    const { id, status, trackingNo } = req.body
    try {
        const existOrder = await OrderWholesale.findById(id)
        if (!existOrder) {
            return res.status(404).json({
                message: 'no order found',
            })
        }
        if (existOrder.transferBy === 'จัดส่ง' && existOrder.deliveryMethod && status === 4 && !trackingNo) {
            return res.status(400).json({
                message: 'need tracking number',
                invalid: 'trackingNo'
            })
        }
        const order = await OrderWholesale.findByIdAndUpdate(id, {status: status, trackingNo: trackingNo}, { new: true })
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

exports.getOrderWholesaleLogs = async(req, res) => {
    const { order_id } = req.params
    try {
        
        const logs = await OrderWholesaleLog.find({order: order_id}).select('-__v')
        return res.status(200).json({
            message: 'success',
            status: true,
            data: logs
        })
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
            const clientAddress = order.userAddress
            const shopOrder = await Shop.findById(order.shop)
            const userOrder = await Client.findById(order.user)
            const formattedOrder = {
                ...order._doc,
                shopName: shopOrder?.name || "",
                userName: userOrder?.displayName || `${userOrder.firstName || ""} ${userOrder.lastName || ""}`
            }
            formattedOrders.push(formattedOrder)
        })
        await Promise.all(promiseOrders)
        
        return res.status(200).json({
            message: `have ${formattedOrders.length} orders`,
            status: true,
            amount: formattedOrders.length,
            data: formattedOrders.sort((a, b) => a.createdAt - b.createdAt)
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
        const order = await OrderWholesale.findById(id).select('-__v')

        if (!order) {
            return res.status(404).json({
                message: 'no order found',
            })
        }

        const allItems = order.items.map(async(item) => {
            const lotto = await LottoWholesale.findById(item).select('-__v -createdAt -updatedAt')
            return lotto
        })
        const promiseItems = await Promise.all(allItems)
        let setLottoPrice = 0
        if (promiseItems.every(x => x)) {
            setLottoPrice = promiseItems.map(x => x.price).reduce((a, b) => a + b, 0)
        } else {
            setLottoPrice = 0
        }

        const allRowItems = order.rowItems.map(async(item) => {
            const lotto = await RowLottoWholesale.findById(item).select('-__v -createdAt -updatedAt').lean()
            if (lotto) {
                let items = lotto.lottos.map(async(lotto) => {
                    const _lotto = await LottoWholesale.findById(lotto).select('-__v -createdAt -updatedAt').lean()
                    return _lotto
                })
                lotto.lottos = await Promise.all(items)
            }
            return lotto
        })
        const promiseRowItems = await Promise.all(allRowItems)
        let rowLottoPrice = 0
        if (promiseRowItems.every(x => x)) {
            rowLottoPrice = promiseRowItems.map(x => x.price).reduce((a, b) => a + b, 0)
        } else {
            rowLottoPrice = 0
        }

       
        const formattedOrder = {
            ...order._doc,
            _items: promiseItems,
            setLottoPrice: setLottoPrice,
            rowLottoPrice: rowLottoPrice,
            _rowItems: promiseRowItems,
            _shop: await Shop.findById(order.shop).select('name code phone email address bankHolder bankAccount bankProvider bankBranch -_id'),
            _user: await Client.findById(order.user).select('displayName code phone email address')
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

// reports
exports.getOrderWholesaleReports = async (req, res) => {
    const { shop_id } = req.query
    try {
        let query = {}

        if (shop_id) { query.shop = shop_id }

        const orders = await OrderWholesale.find(query)
        const status_1 = orders.filter(order => order.status === 1).length
        const status_2 = orders.filter(order => order.status === 2).length
        const status_3 = orders.filter(order => order.status === 3).length
        const status_4 = orders.filter(order => order.status === 4).length
        const status_5 = orders.filter(order => order.status === 5).length
        const status_0 = orders.filter(order => order.status === 0).length
        const allDoneNet = orders.filter(order => order.status === 5).map(order => order.totalNet).reduce((a, b) => a + b, 0)

        return res.status(200).json({
            message: 'success',
            status: true,
            data: {
                status_1,
                status_2,
                status_3,
                status_4,
                status_5,
                status_0,
                allDoneNet
            }
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}

exports.getOrderSlips = async (req, res) => {
    const { order_id } = req.params;
    try {
        if (!order_id) {
            return res.status(400).json({ message: 'order_id not provided' });
        }

        const files = await File.find({ refer: order_id, type: 'payment' });
        
        return res.status(200).json({
            message: 'success',
            status: true,
            data: files
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};