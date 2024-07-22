const express = require('express');
const router = express.Router();
const fileController = require('../../controllers/user/file_controller');
const upload = require('../../middleware/multer');

router.post('/files', upload.single('file'), fileController.createFile);
router.get('/files/:id', fileController.getFilePath);

module.exports = router;