const Lotto = require("../models/Products/lotto.model")
const Order = require("../models/Orders/Order.model")

module.exports = async (req, res) => {
    try {
        const lottos = await Lotto.find({ on_order: true })
        const orders = await Order.find()
        const lottos_id = lottos.map(lotto => lotto._id)
        const lottos_id_in_orders = orders.map(order => order.lotto_id)
        const flatted = lottos_id_in_orders.flat()

        const return_lottos = lottos_id.filter(lotto => !flatted.includes(lotto._id))

        await Lotto.updateMany(
            { _id: { $in: return_lottos } },
            { $set: { on_order: false } }
        )
        .then(()=> console.log('returned ' + return_lottos.length + ' items'))
    }
    catch (err) {
        console.log(err)
    }
}