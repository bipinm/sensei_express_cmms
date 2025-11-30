const express = require('express');
const controller = require('../controllers/attachmentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), controller.uploadAttachment);

router
  .route('/')
  .get(controller.getAttachments)
  .post(controller.createAttachment);

router
  .route('/:id')
  .get(controller.getAttachment)
  .patch(controller.updateAttachment)
  .delete(controller.deleteAttachment);

module.exports = router;
