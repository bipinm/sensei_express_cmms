const express = require('express');
const controller = require('../controllers/workActivityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(controller.getWorkActivities)
  .post(controller.createWorkActivity);

router
  .route('/:id')
  .get(controller.getWorkActivity)
  .patch(controller.updateWorkActivity)
  .delete(controller.deleteWorkActivity);

module.exports = router;
