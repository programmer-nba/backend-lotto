// config model
const Day = require('../models/Config/Day_model.js')

module.exports = dateCheck = async (req, res, next) => {
    try{
        const dateofperiod = await Day.findOne()
        if(!dateofperiod){
            res.send('ERROR! can not check date from server!')
        }
        
        const newdate = new Date()
        const today = newdate.getDate()

        if (today>1 && today<16) {
            dateofperiod.day = '16'
            await dateofperiod.save()
        } else if (today>16) {
            dateofperiod.day = '01'
            await dateofperiod.save()
        }
        
        const setday = dateofperiod.day

        const result = (today.toString()===setday) ? 'close' : 'open'
        console.log(`today is : ${today}`)
        console.log(`setday is : ${setday}`)

        req.config = {
            period: setday,
            market: result
        }

        console.log(`market is : ${req.config.market}`)
        next()
    }
    catch(error){
        res.send('ERROR! can not check date from server!')
        console.log(error)
    }
}