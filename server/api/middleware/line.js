const liff = require('@line/liff')
const path = require('path')

// use .env
const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

liff.init({
    liffId: process.env.LIFF_ID,
    liffKey: process.env.LIFF_KEY,
})