// import database
const Lotto = require('../models/Products/lotto.model.js')

exports.getWholesale = async (req, res) => {
    try{
        const userRole = req.user.role
        const openMarket = req.config.market

        if(openMarket!=='open'){
            return res.send({
                message: "ร้านค้าปิดชั่วคราว เปิดอีกครั้งในวันที่ ... เวลา ..."
            })
        }

        // check role
        if(userRole === "user"){
            return res.send({
                message: "ขออภัย คุณไม่สามารถเข้าดูรายการนี้ได้"
            })
        }
        
        const market = await Lotto.find({market:{$in:["wholesale", "all"]}, on_order: false, sold: false}).populate('seller_id')

        if(market.length === 0){
            return res.send({
                message: `มีฉลากทั้งหมด ${market.length} ชุด`,
                market
            })
        } else {
            return res.status(200).send({
                message: `มีสินค้าในตลาดขายส่งทั้งหมด ${market.length} ชุด`,
                data: market
            })
        } 
    }
    catch(error){
        console.log(error.message)
        res.status(500).send({
            message: "ERROR : please check console"
        })
    }
}

exports.changeMarket = async (req, res) => {
    try{
        let {wholesale, retail} = req.body

        const userRole = req.user.role
        const sellerRole = req.user.seller_role

        const {id} = req.params

        // check params
        if(!id){res.send({
                message : "ไม่พบไอดีสินค้าที่แนบมา"
            })
        }

        // check role
        if(userRole === "user"){
            res.send({
                message: "ขออภัย คุณไม่สามารถเข้าดูรายการนี้ได้"
            })
        }
        if(sellerRole==='ขายปลีก'){
            wholesale = false
        } else {
            wholesale = wholesale
        }

        const newMarket = 
            (retail===true && wholesale===false) ? "retail" :
            (retail===false && wholesale===true) ? "wholesale" :
            (retail===true && wholesale===true) ? "all" :
            "none"

        // check exist product in market
        const product = await Lotto.findByIdAndUpdate(id, {market:newMarket})

        if(!product){
            res.send({
                message : "ไม่พบสินค้านี้ในระบบ"
            })
        }

        return res.send({
            message : `อัพเดทสินค้าลงในตลาด ${newMarket} สมบูรณ์`,
            success : true
        })
    }
    catch(error){
        console.log(error.message)
        res.status(500).send({
            message: "ERROR : please check console"
        })
    }
}

exports.getRetail = async (req, res) => {
    try{
        const userRole = req.user.role

        // check role
        if(userRole === "seller"){
            return res.send({
                message: "ขออภัย คุณไม่สามารถเข้าดูรายการนี้ได้"
            })
        }
        
        const market = await Lotto.find({market:{$in:["retail", "all"]}, on_order: false, sold: false})

        if(market.length === 0){
            return res.send({
                message: `มีฉลากทั้งหมด ${market.length} ชุด`,
                market
            })
        } else {
            return res.status(200).send({
                message: `มีสินค้าในตลาดขายปลีกทั้งหมด ${market.length} ชุด`,
                market: market
            })
        } 
    }
    catch(error){
        console.log(error.message)
        res.status(500).send({
            message: "ERROR : please check console"
        })
    }
}

