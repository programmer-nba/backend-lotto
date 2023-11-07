const express = require('express')
const stream = require('stream')
const multer = require('multer')
const {google} = require('googleapis')
const route = express.Router()
const upload = multer()
const path = require('path')

const KEYFILEPATH = path.join(__dirname, '../../../cred.json')
const SCOPES = 'https://www.googleapis.com/auth/drive'

const auth = new google.auth.GoogleAuth({
    keyFile : KEYFILEPATH,
    scopes : SCOPES
})

route.post('/', upload.any(), async (req,res)=>{
    try{
        console.log(req.body)
        console.log(req.files)
        
        const {body, files} = req

        for(let f = 0 ; f < files.length ; f++){
            await uploadFile(files[f])
        }
        res.send('form submitted')
    }
    catch(f){
        res.send(f.message)
    }
})

const uploadFile = async(fileObject)=>{
    const bufferStream = stream.PassThrough()
    bufferStream.end(fileObject.buffer)

    const {data} = await google.drive({version: "v3", auth}).files.create({
        media: {
            mimeType: fileObject.mimeType,
            body: bufferStream
        },
        requestBody: {
            name: 'profile'+ '.jpg',
            parents: ['14P3z2sjDBWxkHh-f4cGwTh98qCVocory']
        },
        fields: "id,name"
    })
    console.log(`Uploaded file ${data.name} ${data.id}`)
}

route.get('/', (req,res)=>{
    res.sendFile(`${__dirname}/upload.html`)
})

module.exports = route
