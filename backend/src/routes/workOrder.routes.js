const express = require('express');
const controller = require('../controllers/workOrderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(controller.getWorkOrders)
  .post(controller.createWorkOrder);

router
  .route('/:id')
  .get(controller.getWorkOrder)
  .patch(controller.updateWorkOrder)
  .delete(controller.deleteWorkOrder);

module.exports = router;
