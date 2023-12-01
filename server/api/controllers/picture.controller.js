const Picture = require('../models/Pictures/picture.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')

exports.uploadSellerPicture = async (req, res) => {
    const dataIds = req.dataIds
    const {owner, name} = req.body
    const fileId = dataIds[0].replace('file/', '')
    const imgLink = `https://drive.google.com/file/d/${fileId}/view`
    try {
         const newPicture = new Picture(
            {
                owner: owner,
                name: name,
                imgLink: imgLink,
            }
        )
        const savedPicture = await newPicture.save()
        if(!savedPicture){
            return res.send('ไม่สามารถบันทึกได้')
        }

        const seller = await Seller.findById(owner)
        if(!seller){
            return res.send('ไม่เจ้าของบัญชีที่จะบึนทึกรูปนี้')
        }

        let u_personal_img = null
        let u_shop_img = null
        let u_shop_bank = null
        let u_shop_cover = null
        let u_personWithCard = null
        let u_personWithShop = null

        switch (name) {
            case 'personal_img':
                u_personal_img = imgLink
                break
            case 'shop_img':
                u_shop_img = imgLink
                break
            case 'shop_bank':
                u_shop_bank = imgLink
                break
            case 'shop_cover':
                u_shop_cover = imgLink
                break
            case 'personWithCard':
                u_personWithCard = imgLink
                break
            case 'personWithShop':
                u_personWithShop = imgLink
                break
            default:
                break
        }

        seller.personal_img = (u_personal_img!==null) ? u_personal_img : seller.personal_img
        seller.shop_img = (u_shop_img!==null) ? u_shop_img : seller.shop_img
        seller.shop_bank = (u_shop_bank!==null) ? u_shop_bank : seller.shop_bank
        seller.shop_cover = (u_shop_cover!==null) ? u_shop_cover : seller.shop_cover
        seller.personWithCard = (u_personWithCard!==null) ? u_personWithCard : seller.personWithCard
        seller.personWithShop = (u_personWithShop!==null) ? u_personWithShop : seller.personWithShop

        await seller.save()
            .then(()=>{
                res.send({
                    message: 'บันทึกเรียบร้อย',
                    success: true,
                    picture: savedPicture,
                    personal_img: seller.personal_img,
                    shop_img: seller.shop_img,
                    shop_bank: seller.shop_bank,
                    shop_cover: seller.shop_cover,
                    personWithCard: seller.personWithCard,
                    personWithShop: seller.personWithShop,
                })
            })
            .catch((err)=>{
                res.send(err)
            })

    }
    catch (err) {
        console.log(err)
        res.send('error to upload file !')
    }
}

exports.uploadAdminPicture = async (req, res) => {
    const dataIds = req.dataIds
    const {name} = req.body
    const fileId = dataIds[0].replace('file/', '')
    const imgLink = `https://drive.google.com/file/d/${fileId}/view`
    try {
         const newPicture = new Picture(
            {
                owner: 'admin',
                name: name,
                imgLink: imgLink,
            }
        )
        const savedPicture = await newPicture.save()
        if(!savedPicture){
            return res.send('ไม่สามารถบันทึกได้')
        }

        return res.send({
            message: 'บันทึกเรียบร้อย',
            success: true,
            picture: savedPicture,
        })
        
    }
    catch (err) {
        console.log(err)
        res.send('error to upload file !')
    }
}

exports.getAdminPictures = async (req, res) => {
    try {
        const pictures = await Picture.find({owner:'admin'})
        if(!pictures || pictures.length===0){
            return res.send('no any pictures')
        }
        return res.send(pictures)
    }
    catch (err) {
        console.log(err)
        res.send('error to get file !')
    }
}

exports.getAdminPicture = async (req, res) => {
    try {
        const picture = await Picture.findById(req.params.id)
        if(!picture){
            return res.send('no any picture')
        }
        return res.send(picture)
    }
    catch (err) {
        console.log(err)
        res.send('error to get file!')
    }
}

exports.updateAdminPicture = async (req, res) => {
    const dataIds = req.dataIds
    const {name} = req.body
    const {id} = req.params
    const fileId = dataIds[0].replace('file/', '')
    const imgLink = `https://drive.google.com/file/d/${fileId}/view`
    try {
        let picture = await Picture.findById(id)
        if(!picture){
            return res.send('ไม่พบรูปนี้')
        }
        picture.owner = picture.owner
        picture.name = (name!=='') ? name : picture.name
        picture.imgLink = (fileId) ? imgLink : picture.imgLink

        const updatedPicture = await picture.save()
        if(!updatedPicture){
            return res.send('ไม่สามารถบันทึกได้')
        }

        return res.send({
            message: 'บันทึกเรียบร้อย',
            success: true,
            picture: updatedPicture,
        })
        
    }
    catch (err) {
        console.log(err)
        res.send('error to upload file !')
    }
}

exports.deleteAdminPicture = async (req, res) => {
    const {id} = req.params
    try{
        const deletedPicture = await Picture.findByIdAndDelete(id)
        if(!deletedPicture){
            return res.send('ไม่สามารถลบได้')
        }
        res.send({
            message: 'ลบเรียบร้อย',
            success: true,
        })
    }
    catch (err) {
        console.log(err)
        res.send('error to delete file!')
    }
}