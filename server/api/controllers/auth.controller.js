// import database
const User = require('../models/UsersModel/UsersModel.js')
const Seller = require('../models/UsersModel/SellersModel.js')

const jwt = require('jsonwebtoken')

// Login user & seller control
exports.login = async (req, res)=>{
    try {
        const { phone_number, password } = req.body;
        let user = null;

        if (phone_number !== undefined) {
            // First, try to find the user in the User collection
            user = await User.findOne({ phone_number });

            if (!user) {
                // If not found in the User collection, try to find in the Seller collection
                user = await Seller.findOne({ phone_number });

                if (!user) {
                    res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้ในระบบ กรุณาลงทะเบียนผู้ใช้ใหม่' });
                } else if (user.password !== password) {
                    res.status(404).json({ message: 'รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง' });
                }
            } else if (user.password !== password) {
                res.status(404).json({ message: 'รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง' });
            }
        } else {
            // If the phone number is not provided in the request, that's an error.
            res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง กรุณาใส่รหัสผ่านใหม่อีกครั้ง' });
        }

        if (user) {
            // If a user is found and the password is correct, generate a token
            const token = jwt.sign({ id: user._id, role: user.role, seller_role: user.seller_role, name: user.name || "none", status: user.status || "none" }, 'your-secret-key', { expiresIn: '24h' });

            const date = new Date().toString()
            const userRole = user.role
            const savedLoginDate = (userRole === 'user') ? await User.findByIdAndUpdate(user._id, {last_logedIn: date, IP: req.ip}) 
            : await Seller.findByIdAndUpdate(user._id, {last_logedIn: date, IP: req.ip})

            return res.status(200).json({
                token,
                id: user._id,
                role: user.role,
                name: user.name,
                seller_role: user.seller_role,
                status: user.status,
                success: true,
                last_login: savedLoginDate.last_logedIn,
                userIP: savedLoginDate.IP,
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
        console.log({ ERROR: err.message });
    }
}

// seller register
exports.sellerRegister = async (req, res)=>{
    const {
        password, seller_role, line_id, email,
        name, phone_number, address, personal_id,
        shop_name, shop_location,
    } = req.body
    
    const dataIds = req.dataIds
    console.log(dataIds.length)

    const shop_img = (dataIds.length>0 && dataIds.some(id => id.includes('shop_img/'))) 
        ? dataIds.filter(id => id.includes('shop_img'))[0].replace('shop_img/', '')
        : null
        const shop_img_link = (shop_img) 
            ? `https://drive.google.com/file/d/${shop_img}/view` 
            : `https://drive.google.com/file/d/1k7aUdgwRxAiVuq4a9lzQAstUQZ9JEfoG/view`

    const shop_cover = (dataIds.length>0 && dataIds.some(id => id.includes('shop_cover/'))) 
        ? dataIds.filter(id => id.includes('shop_cover'))[0].replace('shop_cover/', '')
        : null
        const shop_cover_link = (shop_cover && dataIds.some(id => id.includes('shop_cover/'))) 
            ? `https://drive.google.com/file/d/${shop_cover}/view` 
            : `https://drive.google.com/file/d/1JBSYh7BdZTPHIxCrxQ7Talpp9R-hDRK7/view`

    const shop_bank = (dataIds.length>0 && dataIds.some(id => id.includes('shop_bank/')))
        ? dataIds.filter(id => id.includes('shop_bank'))[0].replace('shop_bank/', '')
        : null
        const shop_bank_link = (shop_bank) 
            ? `https://drive.google.com/file/d/${shop_bank}/view` 
            : `https://drive.google.com/file/d/1DMQ4c8_K5HBmSyremT80Q2KXySYIPOJ6/view`

    const personal_img = (dataIds.length>0 && dataIds.some(id => id.includes('personal_img/'))) 
        ? dataIds.filter(id => id.includes('personal_img'))[0].replace('personal_img/', '')
        : null
        const personal_img_link = (personal_img) 
            ? `https://drive.google.com/file/d/${personal_img}/view` 
            : `https://drive.google.com/file/d/1C7EGQr0qIuiXdA8HCGU1C-C2imzseg-W/view`

    try{
        
        const sellerExisting = await Seller.findOne({phone_number})
        const userExisting = await User.findOne({phone_number})

        if(sellerExisting || userExisting){
            res.json({message:'เบอร์มือถือนี้มีผู้ใช้งานแล้ว กรุณาลองใหม่อีกครั้ง'})
        } 
        else {
            const newSeller = new Seller(
                {
                    // required form
                    phone_number,
                    password,
                    name,
                    line_id,
                    personal_id,
                    // defualt
                    role : `seller`,
                    seller_role: seller_role,
                    status: `กำลังตรวจสอบ`,

                    // for update
                    email,
                    address,
                    shop_location,
                    shop_name: shop_name || name,

                    // img
                    personal_img : personal_img_link,
                    shop_img : shop_img_link,
                    shop_bank: shop_bank_link, 
                    shop_cover : shop_cover_link,
                }
            )
    
            await newSeller.save()

            res.send({
                message: 'ลงทะเบียนเสร็จสิ้น ! กรุณารอแอดมินยืนยันข้อมูลเพื่อเข้าสู่ระบบ',
                id: newSeller._id,
                role: newSeller.role,
                seller_role: newSeller.seller_role,
                status: newSeller.status,
                success: true,
                shop_img: newSeller.shop_img,
                shop_cover: newSeller.shop_cover,
                shop_bank: newSeller.shop_bank,
                personal_img: newSeller.personal_img
            })

        }
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
}

// user register
exports.userRegister = async (req, res)=>{
    const {password, phone_number, name, address, line_id} = req.body
    try{
        if(!password || !phone_number || !name ){
            res.send('กรุณากรอกข้อมูลให้ถูกต้อง')
        } else {
            const userExisting = await User.findOne({phone_number})
            const sellerExisting = await Seller.findOne({phone_number})

            if(userExisting || sellerExisting){
                res.send('หมายเลขโทรศัพท์ นี้ มีผู้ใช้งานแล้ว กรุณาลองใหม่อีกครั้ง')
            } else {
                const newUser = new User(
                    {
                        name,
                        password, 
                        phone_number,
                        address,
                        line_id,

                        role : 'user'
                    }
                )
        
                await newUser.save()
                res.send(newUser)
            }
        }
    }
    catch(err){
        res.send('ERROR: please check console')
        console.log({ERROR:err.message})
    }
}