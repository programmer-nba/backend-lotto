const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const return_lottos = require('./api/configs/returnLottos.js')
const { checkExpiredItems } = require('./api/controllers/lotto/lotto_controller.js')
const socketio = require('socket.io')
const http = require('http')
const socketController = require('./api/controllers/socket.controller.js')

// import routes
const userRoute = require('./api/routes/user.routes.js')
const adminRoute = require('./api/routes/admin.routes.js')
const authRoute = require('./api/routes/auth.routes.js')
const sellerRoute = require('./api/routes/seller.routes.js')
const meRoute = require('./api/routes/me.routes.js')
const marketRoute = require('./api/routes/market.routes.js')
/* const LinemsgRoute = require('./api/routes/messager.routes.js') */
const orderRoute = require('./api/routes/order.routes.js')
const settingRoute = require('./api/routes/settings.routes.js')
const testRoute = require('./api/routes/test.routes.js')

// use .env
const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// use middleware
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }))
app.set('view engine', 'ejs')

app.use(express.static('uploads'))

// use routes
app.use('/lotto/admin', adminRoute)
app.use('/lotto/seller', sellerRoute)
app.use('/lotto/user', userRoute)
app.use('/lotto/auth', authRoute)
app.use('/lotto/me', meRoute)
app.use('/lotto/market', marketRoute)
/* app.use('/lotto/line', LinemsgRoute) */
app.use('/lotto/setting', settingRoute)
app.use('/lotto/order', orderRoute)
app.use('/lotto/test', testRoute)
app.use('/lotto', require('./api/routes/line.routes'))
app.use('/lotto', require('./api/routes/notify.routes'))

app.use('/lotto/api/v1', require('./api/routes/user/client_router.js'))
app.use('/lotto/api/v1', require('./api/routes/user/shop_router.js'))
app.use('/lotto/api/v1', require('./api/routes/auth/auth_router.js'))
app.use('/lotto/api/v1', require('./api/routes/user/file_router.js'))
app.use('/lotto/api/v1', require('./api/routes/lotto/lotto_router.js'))
app.use('/lotto/api/v1', require('./api/routes/lotto/rowlotto_router.js'))
app.use('/lotto/api/v1', require('./api/routes/order/order_router.js'))
app.use('/lotto/api/v1', require('./api/routes/order/chat_router.js'))
app.use('/lotto/api/v1', require('./api/routes/order/cart_router.js'))
app.use('/lotto/api/v1', require('./api/routes/report'))

// connect app to database -> starting server
const database_url = process.env.DATABASE_URL
const port = process.env.SERVER_PORT || 5555
mongoose.connect(database_url)
    .then(()=>{
        console.log(`----------😀 LOTTO----------`)
        console.log('> database connected \u2714')
    })
    .then(()=>{
        const server = http.createServer(app);
        const io = socketio(server, {
            cors: {
                origin: [
                    'http://localhost:3000',
                    'http://localhost:3001',
                    'http://localhost:15555',
                    'http://localhost:15556',
                    'http://localhost:8080',
                    'http://183.88.209.149:15555',
                    'http://183.88.209.149:15556',
                    'http://lotto-maket.nbadigitalsuccessmore.com',
                    'http://lotto-admin.nbadigitalsuccessmore.com'
                ],
                credentials: false
            }
        });

        socketController(io);

        server.listen(port, () => {
            console.log(`> server start! on port ${port} \u2714`);
            console.log(`----------------------------`);
        });
    })
    .catch((err)=>{
        console.log(`ERROR: database not connected ${err.message}`)
    })

setInterval(() => {
    //return_lottos()
    checkExpiredItems()
}, 60000);

