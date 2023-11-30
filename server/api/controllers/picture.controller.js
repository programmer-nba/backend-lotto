const Picture = require('../models/Pictures/picture.model.js')
const Seller = require('../models/UsersModel/SellersModel.js')

exports.uploadPicture = async (req, res) => {
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