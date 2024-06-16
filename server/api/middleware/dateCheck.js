// config model
const Day = require('../models/Config/Day_model.js')

module.exports = dateCheck = async (req, res, next) => {
    try{
        let dayconfig = await Day.findOne()
        if(!dayconfig){
            req.config = false
        } else {
            req.config = dayconfig
            console.log(dayconfig)
        }
        next()
    }
    catch(error){
        console.log(error)
        return res.send('ERROR! can not check date from server!')
    }
}