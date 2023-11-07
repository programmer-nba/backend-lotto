const express = require('express')
const {initializeApp} = require('firebase/app')
const {getStorage, ref, getDownloadURL, uploadBytesResumable} = require('firebase/storage')
const multer = require('multer')
const {google} = require('googleapis')
const route = express.Router()
const path = require('path')

const KEYFILEPATH = path.join(__dirname, '../../../../cred.json')
const SCOPES = 'https://www.googleapis.com/auth/drive'

const auth = new google.auth.GoogleAuth({
    keyFile : KEYFILEPATH,
    scopes : SCOPES
})

route.post('/', async (req,res)=>{

})

route.get('/', (req,res)=>{
    res.sendFile(`${__dirname}/upload.html`)
})

module.exports = route
