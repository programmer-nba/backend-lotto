import express from 'express'
import Users from '../Models/UsersModel.js'

const route = express.Router()

//get all users infomation
route.get('/', async (req,res)=>{
    try{
        const users = await Users.find()

        if (!users) {
            return res.status(404).send('Not any user in database, please create new user')
        } 
        
        return res.status(200).send(users) 
    }
    catch(error){
        res.status(500).send("ERROR: plase check console")
        console.log(error.message)
    }
})

//get an user infomation
route.get('/:id', async (req,res)=>{
    try{
        const {id} = req.params
        const user = await Users.findById(id)
        
        const result = (user) ? user : "user does'nt exit"

        return res.status(200).send(result)
    }
    catch(error){
        res.status(500).send("ERROR: plase check console")
        console.log(error.message)
    }
})

//create a new user
route.post('/create', async (req,res)=>{
    try{(
            !req.body.username ||
            !req.body.password ||
            !req.body.password2 ||
            !req.body.first_name ||
            !req.body.last_name ||
            !req.body.email
        ) && res.send('Please request fileds correctly : username, password, password2, first_name, last_name, email')
        
        const user_info = req.body
        const newUser = new Users(user_info)
        const saveUser = await newUser.save()

        if (saveUser){
            console.log(`new user created! as ${saveUser.username} : ${saveUser.createdAt}`)
            console.log(`${Users.length} users in your app`)
            return res.status(201).send(saveUser)
        } else {
            return res.status(500).send('Can not creat this user! please try again')
        }

    }
    catch(error){
        res.status(500).send("ERROR: plase check console")
        console.log(error.message)
    }
})

//update an user infomation
route.put('/:id', async (req,res)=>{
    try{(
            !req.body.username ||
            !req.body.password ||
            !req.body.password2 ||
            !req.body.first_name ||
            !req.body.last_name ||
            !req.body.email
        ) && res.send('Please request fileds correctly : username, password, password2, first_name, last_name, email')

        const {id} = req.params
        const prev_user = await Users.findByIdAndUpdate(id, req.body)
        const updated_user = await Users.findById(id)
        
        if (updated_user){
            return res.status(201).send(`User info updated successfully!`)
        } else {
            return res.status(500).send(`User info update fail`)
        }
        
    }
    catch(error){
        res.status(500).send("ERROR: plase check console")
        console.log(error.message)
    }
})

//delete an user******
route.delete('/:id', async (req,res)=>{
    try{
        const {id} = req.params

        const user = await Users.findByIdAndDelete(id)

        if(user){
            res.status(201).send("User deleted successfully!")
        } else {
            res.status(404).send("User not found")
        }
        
    }
    catch(error){
        res.status(500).send("ERROR: plase check console")
        console.log(error.message)
    }
})

export default route