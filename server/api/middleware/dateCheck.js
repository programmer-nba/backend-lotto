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
        let nextt = null

        if (today>1 && today<16) {
            dateofperiod.day = '16'
            await dateofperiod.save()
            nextt = 0
        } else if (today>16) {
            dateofperiod.day = '01'
            await dateofperiod.save()
            nextt = 1
        }
        
        // will run on admin site----------------------------

        const year = "2566"
        
        const now = new Date()
        const mountpre = now.getMonth()
        const monthIndex = mountpre + nextt
        const months = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤษจิกายน", "ธันวาคม"
        ]

        const currentMonth = months[monthIndex]

        const mount_year = `${currentMonth} ${year}`

        //----------------------------------------------
        
        const setday = dateofperiod.day

        const result = (today.toString()===setday) ? 'close' : 'open'
        console.log(`today is : ${today}`)
        console.log(`setday is : ${setday}`)

        req.config = {
            period: `${setday} ${mount_year}`,
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