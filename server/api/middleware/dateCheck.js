// config model
const Day = require('../models/Config/Day_model.js')

module.exports = dateCheck = async (req, res, next) => {
    try{
        const dateofperiod = await Day.findOne()
        console.log(dateofperiod.day)
        if(!dateofperiod){
            res.send('ERROR! can not check date from server!')
        }
        
        const newdate = new Date()
        const today = newdate.getDate()
        let nextt = null
        let setday = null
        if(parseInt(dateofperiod.day)===1 || parseInt(dateofperiod.day)===16){
            if (today>=1 && today<16) {
                dateofperiod.day = 16
                await dateofperiod.save()
                nextt = 0
                setday = parseInt(dateofperiod.day)
            } else if (today>16) {
                dateofperiod.day = 1
                await dateofperiod.save()
                nextt = 1
                setday = parseInt(dateofperiod.day)
            }
        } else if (parseInt(dateofperiod.day)!==1 || parseInt(dateofperiod.day)!==16) {
            setday = parseInt(dateofperiod.day)
        }
        
        // will run on admin site----------------------------

        const year = "2567"
        
        const now = new Date()
        const mountpre = now.getMonth()
        const monthIndex = mountpre + nextt
        const months = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤษจิกายน", "ธันวาคม"
        ]

        const targetMonth = months[monthIndex]
        const currMounth = months[mountpre]

        const mount_year = `${targetMonth} ${year}`

        //----------------------------------------------

        const result = (today===setday-1 || today===setday) ? 'close' : 'open'
        console.log(`today is : ${today} ${currMounth} ${year}`)
        console.log(`setday is : ${setday} ${mount_year}`)

        req.config = {
            period: `${setday} ${mount_year}`,
            market: result, //result
            openIn: parseInt(setday)+1,
            openInText: `${parseInt(setday)+1} ${mount_year}`,
            toDay: `${today} ${currMounth} ${year}`,
            curMY: `${currMounth} ${year}`,
            nextMY: `${mount_year}`,
            closeIn: `${setday-1}`,
            closeInText: `${setday-1} ${mount_year}`
        }

        console.log(`market is : ${req.config.market}`)
        console.log(`close on : ${setday-1} ${mount_year}`)
        console.log(`next open on : ${parseInt(setday)+1} ${mount_year}`)
        next()
    }
    catch(error){
        res.send('ERROR! can not check date from server!')
        console.log(error)
    }
}