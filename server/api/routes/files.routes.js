const route = require('express').Router();
const { google } = require('googleapis');
const multer = require('multer'); 
const key = require('../../../cred.json');
const path = require('path')
const fs = require('fs')
const Seller = require('../models/UsersModel/SellersModel.js')

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: key.client_email,
    private_key: key.private_key,
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({version: 'v3', auth});

const upload = multer({ dest: 'uploads/' }); // Adjust destination folder as needed

route.post('/', upload.any(), async (req, res) => {
  try{

    console.log(req.body);
    console.log(req.files)

    const {body, files} = req

    for(let f=0 ; f<files.length ; f++){
      await uploadFile(files[f])
    }

    res.send('form submitted')
  }
  catch(err){
    console.log(err)
  }
});

const uploadFile = async (fileObjects) => {
  try{
  const {data} = await drive.files.create({
      media : {
        mimeType: fileObjects.mimetype,
        body: fs.createReadStream(path.join(__dirname, '..', '..', fileObjects.path))
      },
      requestBody : {
        name: fileObjects.originalname,
        parents: ["1C_GASrUjSus7uDC4-_VQWpuYIfistQe7"]
      },
      fields : 'id, name'
  })

  fs.unlink(path.join(__dirname, '..', '..', fileObjects.path), (err)=>{
    if(err){
        console.log('unlink error')
    } else {
        console.log('unlink success')
    }
  })

  console.log(`Upload file ${data.name} ${data.id}`)
  }
  catch(err){
    console.log(err)
  }
}

module.exports = route