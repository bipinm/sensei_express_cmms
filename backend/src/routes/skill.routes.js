const express = require('express');
const controller = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(controller.getSkills)
  .post(controller.createSkill);

router
  .route('/:id')
  .get(controller.getSkill)
  .patch(controller.updateSkill)
  .delete(controller.deleteSkill);

module.exports = router;
