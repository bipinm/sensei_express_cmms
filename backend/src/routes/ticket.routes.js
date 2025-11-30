const express = require('express');
const controller = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(controller.getTickets)
  .post(controller.createTicket);

router
  .route('/:id')
  .get(controller.getTicket)
  .patch(controller.updateTicket)
  .delete(controller.deleteTicket);

router.post('/:id/analyze', controller.analyzeTicket);

module.exports = router;
