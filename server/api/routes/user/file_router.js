const express = require('express');
const router = express.Router();
const fileController = require('../../controllers/user/file_controller');
const upload = require('../../middleware/multer');
const verifyToken = require('../../middleware/verifyToken');

router.post('/files', verifyToken, upload.single('file'), fileController.createFile);
router.get('/files/:id', verifyToken, fileController.getFilePath);
router.get('/:owner/files', verifyToken, fileController.getUserFiles);
router.get('/:owner/shops/:shop/files', verifyToken, fileController.getShopFiles);

module.exports = router;