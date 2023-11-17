// multer
const multer = require('multer')
const upload = multer({ dest: 'uploads/' }).any()
// use middleware >>> upload

// google drive api
const { google } = require('googleapis')
const key = require('../../../cred.json')
const path = require('path')
const fs = require('fs')

// drive setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: key.client_email,
    private_key: key.private_key,
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
})
const drive = google.drive({version: 'v3', auth});

// upload file
const uploadPictures = async (req, res, next) => {
  try{
    console.log(req.body)
    console.log(req.files)

    const {body, files} = req

    const shopname = body.shop_name || body.name

    const dataIds = []

    for(let f=0 ; f<files.length ; f++){
      const data = await uploadFile(files[f], shopname)
      console.log(`dataId = ${data.id}`)
      dataIds.push(data.id)
    }

    req.dataIds = dataIds
    next()
  }
  catch(err){
    console.log(err)
  }
}

const uploadFile = async (fileObjects, shopname) => {
  try{
    // Date time formatting
    const now = new Date();
    const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now
    .getHours()
    .toString()
    .padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now
    .getSeconds()
    .toString()
    .padStart(2, '0')}`

  const {data} = await drive.files.create({
      media : {
        mimeType: fileObjects.mimetype,
        body: fs.createReadStream(path.join(__dirname, '..', '..', fileObjects.path))
      },
      requestBody : {
        name: `${fileObjects.fieldname}%^${shopname}#^${formattedDateTime}`,
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
  return data

  }
  catch(err){
    console.log(err)
  }
}

module.exports = {upload, uploadPictures}