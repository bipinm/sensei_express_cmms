const express = require('express');
const controller = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(controller.getAssets)
  .post(controller.createAsset);

router
  .route('/:id')
  .get(controller.getAsset)
  .patch(controller.updateAsset)
  .delete(controller.deleteAsset);

module.exports = router;
