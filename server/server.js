const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const userData = require('./api/routes/user/userData.js')
const userAuth = require('./api/routes/user/userAuth.js')

const adminAuth = require('./api/routes/admin/adminAuth.js')

const sellerAuth = require('./api/routes/seller/sellerAuth.js')
const sellerData = require('./api/routes/seller/sellerData.js')
const sellerStore = require('./api/routes/seller/store/addLotto.js')

const UpLoadFiles = require('./api/routes/uploadImages.js')

const getMe = require('./api/routes/getMe.js')

// use .env
const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// set app
const app = express()

app.use(cors())

app.use('/lotto/user/data', userData) // get data of users
app.use('/lotto/user/auth', userAuth) // register, login user

app.use('/lotto/seller/data', sellerData) // get data of sellers
app.use('/lotto/seller/auth', sellerAuth) // register, login seller
app.use('/lotto/seller/mystore', sellerStore) // seller stores for add lotteries

app.use('/lotto/admin', adminAuth) // login admin

app.use('/lotto/me', getMe) // get me


app.use('/lotto/upload', UpLoadFiles) // uploadImages

app.get('/lotto/demodata', (req, res)=>{
    res.send({
        "_id": "6549e5ad75382db5e2556bcd",
        "status": "confirm",
        "password": "123",
        "role": "ขายปลีก",
        "line_id": "seller",
        "name": "seller",
        "phone_number": "seller000",
        "personal_id": "1234567890123",
        "createdAt": "2023-11-07T07:22:21.280Z",
        "updatedAt": "2023-11-08T02:16:51.919Z",
        "__v": 0,
        "stores": [
            {
                "period": "16 พ.ย. 2566",
                "numbers": [
                    "001",
                    "002",
                    "003",
                    "004",
                    "005"
                ],
                "_id": "6549fe94be8b98bdfe65466f"
            },
            {
                "period": "16 ธ.ค. 2566",
                "numbers": [
                    "001",
                    "001",
                    "001",
                    "001"
                ]
            },
            {
                "period": "16 ธ.ค. 2566",
                "numbers": [
                    "001",
                    "001",
                    "001",
                    "001"
                ]
            }
        ]
    })
})

app.use(express.static('server/public'))

// connect app to database -> starting server
const database_url = process.env.DATABASE_URL
const port = process.env.SERVER_PORT || 3000

mongoose.connect(database_url)
    .then(()=>{
        console.log('database connected')
    })
    .then(()=>{
        app.listen(port, ()=>{
            try{
                console.log(`server start! on port ${port}`)
            }
            catch(err){
                console.log(`server strting error : ${err.message}`)
            }
        })
    })
    .catch((err)=>{
        console.log(`ERROR: database not connected ${err.message}`)
    })

