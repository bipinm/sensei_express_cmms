const express = require('express');
const controller = require('../controllers/personController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router
  .route('/')
  .get(controller.getPersons)
  .post(controller.createPerson);

router
  .route('/:id')
  .get(controller.getPerson)
  .patch(controller.updatePerson)
  .delete(controller.deletePerson);

module.exports = router;
