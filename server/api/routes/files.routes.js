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
exports.uploadPictures = async (req, res) => {
  try{
    console.log(req.body)
    console.log(req.files)

    const {body, files} = req

    const shopname = body.shop_name || body.name

    for(let f=0 ; f<files.length ; f++){
      await uploadFile(files[f], shopname)
      res.send(`file submitted (${f+1})`)
    }

    return res.send('form submitted')
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
  }
  catch(err){
    console.log(err)
  }
}