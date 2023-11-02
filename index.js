import express from 'express'
import mongoose from 'mongoose'
import {PORT, mongodb_url} from './config.js' //import things in config.js for clean
import usersRoute from './Routes/Users.js'

//set up express
const app = express()
app.use(express.json())

app.use('/api/users', usersRoute)

//testing api route
app.get('/', (req,res)=>{
    try{
        return res.status(500).send("Hello Lotto!")
    } catch (error) {
        console.log(error.message)
    }
})

//connect to database(mongodb) and starting server + handling error
mongoose.connect(mongodb_url)
const db = mongoose.connection
db.on("error", ()=>{
    console.log("Database connectioin error!")
    console.log(`DB-CONNECTIONE RROR: ${error.message}`)
})
db.once("open", ()=>{
    console.log('Connect to database..success')
    app.listen(PORT, ()=>{
        try{
            console.log(`Start server on port ${PORT} successfully`)
        } catch (error) {
            console.log("Server error!")
            console.log(`SERVER-ERROR: ${error.message}`)
        }
    })
})
    

    
    
    


