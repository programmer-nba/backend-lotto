// multer
const multer = require('multer')

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'text'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
  }
};

const upload = multer({
  dest: 'uploads/', // Specify the destination folder
  limits: { fileSize: 100 * 1024 * 1024 }, // Set the maximum file size to 100 MB
  fileFilter: fileFilter, // Specify the file filter function
}).any()

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

  const date = new Date()
  const time = date.getTime().toString()

  const {body, files} = req
  const name = body.name || body.shop_name || time
  const dataIds = [] // send this to register
  console.log(`name : ${name}`)
  console.log(`files:${req.files}`)

  try{
    if(!files){
      return res.send('no any files ?')
    }
    // upload each file to drive
    for(let f=0 ; f<files.length ; f++){
      const data = await uploadtoDrive(files[f], name)
      if(!data){
        console.log(`upload failed`)
        return res.send('upload failed')
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
    res.send('fail upload files')
  }
}

const uploadtoDrive = async (fileObjects, name) => {
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
        name: `${fileObjects.fieldname}%^${name}#^${formattedDateTime}`,
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