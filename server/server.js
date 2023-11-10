const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const userData = require('./api/routes/user/userData.js')
const userAuth = require('./api/routes/user/userAuth.js')
const userMarkets = require('./api/routes/user/purchase/markets.js')

const adminAuth = require('./api/routes/admin/adminAuth.js')

const login = require('./api/routes/login.js')

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
app.use('/lotto/user/purchase', userMarkets) // ******

app.use('/lotto/seller/data', sellerData) // get data of sellers
app.use('/lotto/seller/auth', sellerAuth) // register
app.use('/lotto/seller/mystore', sellerStore) // seller stores for add lotteries

app.use('/lotto/admin', adminAuth) // login admin

app.use('/lotto/me', getMe) // get me

app.use('/lotto/login', login) // login

const lotteries = require('./api/routes/product/lotteries.js')
app.use('/lotto/product', lotteries)

app.use('/lotto/upload', UpLoadFiles) // uploadImages

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

