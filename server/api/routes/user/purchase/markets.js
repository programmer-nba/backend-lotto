const Seller = require('../../../models/UsersModel/SellersModel.js')
const route = require('express').Router()

const getAllLotteries = async () => {
    const sellers = await Seller.find()
    
    const lotteries = sellers.flatMap((item)=>
    item.stores.flatMap((store)=>store.numbers)
    )

    return lotteries
}

route.get('/markets', async (req, res)=>{
    const lotteries = await getAllLotteries()

    res.send(lotteries)
})

module.exports = route