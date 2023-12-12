// import database
const Lotto = require('../models/Products/lotto.model.js')

exports.getWholesale = async (req, res) => {
    try{
        const userRole = req.user.role
        const openMarket = req.config.market
        const lottoDay = req.config.period
        const openIn = req.config.openIn
        const openInText = req.config.openInText
        const toDay = req.config.toDay
        const closeIn = req.config.openIn-2

        if(openMarket!=='open'){
            return res.send({
                toDay: toDay,
                message: `ร้านค้าปิดชั่วคราว เปิดอีกครั้งในวันที่ ${openInText}`,
                openIn: openIn
            })
        }

        // check role
        if(userRole === "user"){
            return res.send({
                message: "ขออภัย คุณไม่สามารถเข้าดูรายการนี้ได้"
            })
        }
        
        const wholesaleLottos = await Lotto.find({market:{$in:["wholesale"]}, on_order: false, sold: false, cut_stock: false}).populate('seller_id', '_id name shop_name shop_img shop_cover')
        let allLottos = await Lotto.find({market:{$in:["all"]}, on_order: false, sold: false, cut_stock: false}).populate('seller_id', '_id name shop_name shop_img shop_cover')

        allLottos.forEach(item=>{
            item.price = item.prices.wholesale.total || item.price
        })

        const market = [...wholesaleLottos, ...allLottos]

        if(market.length === 0){
            return res.send({
                message: `มีฉลากทั้งหมด ${market.length} ชุด`,
                market,
                marketStatus: openMarket,
                lottoDay: lottoDay,
                marketText: `วันนี้วันที่ ${toDay} , ตลาด ${openMarket}, ตลาดจะปิดในวันที่ ${closeIn}`,
                closeIn: closeIn
            })
        } else {
            return res.status(200).send({
                message: `มีสินค้าในตลาดขายส่งทั้งหมด ${market.length} ชุด`,
                data: market,
                lottoDay: lottoDay,
                marketStatus: openMarket,
                marketText: `วันนี้วันที่ ${toDay} , ตลาด ${openMarket}, ตลาดจะปิดในวันที่ ${closeIn}`,
                closeIn: closeIn
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

exports.getAllsome = async (req, res) => {
    try{
        const openMarket = req.config.market
        const lottoDay = req.config.period
        const {length} = req.params

        if(openMarket!=='open'){
            return res.send({
                message: "ร้านค้าปิดชั่วคราว เปิดอีกครั้งในวันที่ ... เวลา ..."
            })
        }
        
        const random = await Lotto.aggregate([
            {
                $match:{
                    on_order: false, sold: false, cut_stock: false
                }
            },
            {
                $sample:{
                    size:parseInt(length)
                }
            }
        ])
        if(random.length === 0){
            return res.send({
                message: `มีฉลากทั้งหมด ${random.length} ชุด`,
                lottos:random,
                lottoDay: lottoDay
            })
        } else {
            return res.status(200).send({
                message: `มีสินค้าในตลาดขายส่งทั้งหมด ${random.length} ชุด`,
                lottos: random,
                lottoDay: lottoDay
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

exports.getAll = async (req, res) => {
    try {
        const adminRole = req.user.role
        if(adminRole!=='admin'){
            return res.send('คุณไม่ใช่ admin')
        }

        const lottos = await Lotto.find()
        if(!lottos || lottos.length===0){
            return res.send({
                message: 'ไม่พบสลากในระบบ',
                lottos: lottos || []
            })
        }

        const retail_lottos = lottos.filter(lotto=>lotto.market==='retail')
        const wholesale_lottos = lottos.filter(lotto=>lotto.market==='wholesale')
        const all_lottos = lottos.filter(lotto=>lotto.market==='all')
        const none_lottos = lottos.filter(lotto=>lotto.market==='none')

        return res.send({
            message: `มีสลากในระบบทั้งหมด ${lottos.length} ชุด`,
            length: {
                total: lottos.length,
                wholesale: wholesale_lottos.length,
                retail: retail_lottos.length,
                all: all_lottos.length,
                none: none_lottos.length
            },
            lottos: lottos
        })
    }
    catch (err) {
        res.send('ERROR cannot get all lottos')
        console.log(err.message)
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
        const openMarket = req.config.market
        const lottoDay = req.config.period

        // check role
        if(userRole === "seller"){
            return res.send({
                message: "ขออภัย คุณไม่สามารถเข้าดูรายการนี้ได้"
            })
        }
        
        const market = await Lotto.find({market:{$in:["retail", "all"]}, on_order: false, sold: false, cut_stock: {$in:[false, null, undefined]}}).populate('seller_id', '_id name shop_img shop_cover')

        if(market.length === 0){
            return res.send({
                message: `มีฉลากทั้งหมด ${market.length} ชุด`,
                market,
                lottoDay
            })
        } else {
            return res.status(200).send({
                message: `มีสินค้าในตลาดขายปลีกทั้งหมด ${market.length} ชุด`,
                market: market,
                lottoDay
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
