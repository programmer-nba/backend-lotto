// import database
const Wholesale = require('../models/Markets/wholesale.model.js')

exports.getinMarket = async (req, res) => {
    try{
        const userRole = req.user.role

        // check role
        if(userRole === "user"){
            res.send({
                message: "ขออภัย คุณไม่สามารถเข้าดูรายการนี้ได้"
            })
        }
        
        const market = await Wholesale.find().populate('lotto_id')

        return res.status(200).send({
            message: "",
            data: market
        })
    }
    catch(error){
        console.log(error.message)
        res.status(500).send({
            message: "ERROR : please check console"
        })
    }
}

exports.addtoMarket = async (req, res) => {
    try{
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

        // check seller role
        if(userRole === "seller" && sellerRole !== "ขายส่ง"){
            res.send({
                message : "ขออภัย คุณต้องลงทะเบียนเป็นร้านค้า 'ขายส่ง' เท่านั้นถึงจะทำรายการนี้ได้"
            })
        }

        // check exist product in market
        const existProduct = await Wholesale.findOne({lotto_id: id})

        if(existProduct){
            res.send({
                message : "สินค้านี้ถูกเพิ่มลงในตลาดขายส่งแล้ว"
            })
        }

        const product = await Wholesale.create({lotto_id: id})

        return res.send({
            message : "เพิ่มสินค้าลงในตลาดขายส่ง สมบูรณ์",
            data : product,
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

exports.removefromMarket = async (req, res) => {
    try{
        const userRole = req.user.role
        const sellerRole = req.user.seller_role
        const {id} = req.params

        // check params
        if(!id){res.send({
            message : "ไม่พบไอดีสินค้าที่แนบมา"
        })}

        // check role
        if(userRole === "user"){
            res.send({
                message: "ขออภัย คุณไม่สามารถเข้าดูรายการนี้ได้"
            })
        }

        // check seller role
        if(userRole === "seller" && sellerRole !== "ขายส่ง"){
            res.send({
                message : "ขออภัย คุณต้องลงทะเบียนเป็นร้านค้า 'ขายส่ง' เท่านั้นถึงจะทำรายการนี้ได้"
            })
        }
        
        const product = await Wholesale.find({lotto_id:id})

        if(!product || product.length === 0){
            res.send({
                message : "ไม่พบสินค้านี้ในตลาดขายส่ง"
            })
        }

        if(product && product.length > 0){
            for(let i in product){
                console.log(`product._id = ${product[i]._id}`)
                await Wholesale.findByIdAndDelete(product[i]._id)
                console.log("ลบสินค้าสำเร็จ")
            }
        }

        await Wholesale.findByIdAndDelete(product._id)

        res.send({
            message: "ลบสินค้าในตลาดขายส่ง เรียบร้อย",
            product
        })
    }

    
    catch(error){
        console.log(error.message)
        res.status(500).send({
            message: "ERROR : please check console"
        })
    }
}