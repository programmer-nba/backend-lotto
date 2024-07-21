const File = require('../../models/user/file_model')
const path = require('path')

exports.createFile = async (req, res) => {
    const { owner, title, type, refer } = req.body
    const { fileName, mimetype, path: filePath } = req.file
    try {
        if (!owner || !title || !type || !refer || !fileName || !fileType || !filePath) {
            return res.status(400).json({ error: 'Please add all fields' })
        }
        const newFile = new File({
            owner: owner,
            title: title,
            type: type,
            refer: refer,
            fileName: fileName,
            fileType: mimetype,
            filePath: filePath,
        })

        await newFile.save()
        return res.status(200).json({
            message: 'success',
            status: true
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getFilePath = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ message: 'ID not provided' });
        }
        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        const fileLocation = path.join(__dirname, '../../../uploads', file.filePath);
        return res.status(200).json({
            message: 'success',
            status: true,
            filePath: fileLocation
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}