const File = require('../../models/user/file_model');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../..', '.env') });

exports.createFile = async (req, res) => {
    const { owner, title, type, refer } = req.body;
    const { filename: fileName, mimetype } = req.file || {}; // Prevent destructuring error by defaulting to empty object

    try {
        if (!owner || !title || !type || !refer || !fileName || !mimetype) {
            return res.status(400).json({ error: 'Please add all fields' });
        }
        const newFile = new File({
            owner: owner,
            title: title,
            type: type,
            refer: refer,
            fileName: fileName,
            fileType: mimetype,
            filePath: process.env.BASE_URL + '/' + fileName,
        });

        await newFile.save();
        console.log(newFile);
        return res.status(200).json({
            message: 'success',
            status: true,
            data: newFile
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};

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
};

exports.getUserFiles = async (req, res) => {
    const { owner } = req.params;
    try {
        if (!owner) {
            return res.status(400).json({ message: 'ID not provided' });
        }
        const files = await File.find({ owner: owner });
        
        return res.status(200).json({
            message: 'success',
            status: true,
            data: files
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};

exports.getShopFiles = async (req, res) => {
    const { owner, shop } = req.params;
    const { filter } = req.query
    try {
        if (!owner  || !shop) {
            return res.status(400).json({ message: 'ID or ShopId not provided' });
        }
        let query = { owner: owner, refer: shop }

        if (filter) {
            query = { ...query, title: filter }
        }

        const files = await File.find(query);
        
        return res.status(200).json({
            message: 'success',
            status: true,
            data: files
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};
