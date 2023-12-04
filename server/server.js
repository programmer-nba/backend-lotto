const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
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
const testRoute = require('./api/routes/test.routes.js')

// use .env
const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// use middleware
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }))

// use routes
app.use('/lotto/admin', adminRoute)
app.use('/lotto/seller', sellerRoute)
app.use('/lotto/user', userRoute)
app.use('/lotto/auth', authRoute)
app.use('/lotto/me', meRoute)
app.use('/lotto/market', marketRoute)
/* app.use('/lotto/line', LinemsgRoute) */
app.use('/lotto/order', orderRoute)
app.use('/lotto/test', testRoute)

const server = http.createServer(app)

// connect app to database -> starting server
const database_url = process.env.DATABASE_URL
const port = process.env.SERVER_PORT || 5555
mongoose.connect(database_url)
    .then(()=>{
        console.log(`----------😀 LOTTO----------`)
        console.log('> database connected \u2714')
    })
    .then(()=>{
        server.listen(port, ()=>{
            try{

                console.log(`> server start! on port ${port} \u2714`)
                console.log(`----------------------------`)

                const io = socketio(server, {
                    cors: {
                        origin: 'http://localhost:3000'
                    }
                })
                socketController(io)

            }
            catch(err){
                console.log(`server strting error : ${err.message}`)
            }
        })
    })
    .catch((err)=>{
        console.log(`ERROR: database not connected ${err.message}`)
    })

