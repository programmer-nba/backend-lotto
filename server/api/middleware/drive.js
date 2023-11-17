// multer
const multer = require('multer')
const upload = multer({ dest: 'uploads/' }).any()

// google drive
const { google } = require('googleapis')
const key = require('../../../cred.json')
const path = require('path')
const fs = require('fs')

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: key.client_email,
    private_key: key.private_key,
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
})
const drive = google.drive({version: 'v3', auth})

// upload file
const uploadPictures = async (req, res, next) => {

  console.log(`shopname:${req.body.shopname}, name:${req.body.name}`)
  console.log(`files:${req.files}`)

  const {body, files} = req
  const shopname = body.shop_name || body.name
  const dataIds = [] // send this to register

  try{
    // upload each file to drive
    for(let f=0 ; f<files.length ; f++){
      const data = await uploadtoDrive(files[f], shopname)
      if(data===null){
        console.log(`upload failed`)
        res.send('upload failed')
      }
      const prefix = `${files[f].fieldname}/`
      console.log(`dataId = ${data.id}`)
      dataIds.push(prefix+data.id)
      console.log(`dataIds = ${dataIds.length}`)
      console.log(`----------------------------`)
    }

    req.dataIds = dataIds
    next()
  }
  catch(err){
    console.log(err)
  }
}

const uploadtoDrive = async (fileObjects, shopname) => {
  try{
    // Date time formatting
    const now = new Date()
    const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now
    .getHours()
    .toString()
    .padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now
    .getSeconds()
    .toString()
    .padStart(2, '0')}`

    // create files to drive
    const {data} = await drive.files.create({
      media : {
        mimeType: fileObjects.mimetype,
        body: fs.createReadStream(path.join(__dirname, '..', '..', fileObjects.path))
      },
      requestBody : {
        name: `${fileObjects.fieldname}%^${shopname}#^${formattedDateTime}`,
        parents: ["1C_GASrUjSus7uDC4-_VQWpuYIfistQe7"] // folder id in drive
        //parents: ["1_yaWYR7kqskP9eGjS6jeuwQ9DEmD69i5"] // test folder
      },
      fields : 'id'
    })

    // clear temporary files in /uploads folder
    fs.unlink(path.join(__dirname, '..', '..', fileObjects.path), (err)=>{
      if(err){
          console.log('clear file in /uploads error')
      } else {
          console.log('clear file in /uploads success')
      }
    })

    if(!data){
      console.log(`upload file fail!`)
      return null
    }
    console.log(`----------------------------`)
    console.log(`Upload file to drive success`)
    return data // return data to uploadPicture function

  }
  catch(err){
    console.log(err)
  }
}

module.exports = {upload, uploadPictures}