const { google } = require('googleapis')
const fs = require('fs')
const key = require('../../../cred.json')
const stream = require('stream')


const auth = new google.auth.GoogleAuth({
  keyFile: key,
  scopes: ['https://www.googleapis.com/auth/drive.file'],  
})

const drive = google.drive({ version: 'v3', auth })


exports.uploadFile = async (req, res) => {
    
    console.log(req.body)

    if(!req.body.file){
        return res.send('no file')
    }

    const fileMetadata = {
        name: req.body.file.originalname,
        parents: ['1C_GASrUjSus7uDC4-_VQWpuYIfistQe7'],
      };
    
      const media = {
        mimeType: req.body.file.mimetype,
        body: fs.createReadStream(req.body.file.path),
      };
    
      try {
        const response = drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id',
        })

        fs.unlinkSync(req.body.file.path)
    
        // Respond to the frontend with the file ID or other relevant information
        res.send({ fileId: response.data.id });
      } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}