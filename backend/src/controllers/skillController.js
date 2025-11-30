const { Skill } = require('../models');
const AppError = require('../utils/appError');

const getSkills = async (req, res, next) => {
  try {
    const items = await Skill.findAll({ order: [['name', 'ASC']] });

    res.status(200).json({
      status: 'success',
      results: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

const getSkill = async (req, res, next) => {
  try {
    const item = await Skill.findByPk(req.params.id);

    if (!item) {
      return next(new AppError('Skill not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const item = await Skill.create(req.body);

    res.status(201).json({
      status: 'success',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const updateSkill = async (req, res, next) => {
  try {
    const item = await Skill.findByPk(req.params.id);

    if (!item) {
      return next(new AppError('Skill not found', 404));
    }

    await item.update(req.body);

    res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    const item = await Skill.findByPk(req.params.id);

    if (!item) {
      return next(new AppError('Skill not found', 404));
    }

    await item.destroy();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
};
