const { Person } = require('../models');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');

const sanitize = (person) => {
  if (!person) return null;
  const { passwordHash, ...rest } = person.get({ plain: true });
  return rest;
};

const getPersons = async (req, res, next) => {
  try {
    const items = await Person.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      results: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

const getPerson = async (req, res, next) => {
  try {
    const item = await Person.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!item) {
      return next(new AppError('Person not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const createPerson = async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;

    if (!password) {
      return next(new AppError('Password is required', 400));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const person = await Person.create({ ...rest, passwordHash });

    res.status(201).json({
      status: 'success',
      data: sanitize(person),
    });
  } catch (err) {
    next(err);
  }
};

const updatePerson = async (req, res, next) => {
  try {
    const person = await Person.findByPk(req.params.id);

    if (!person) {
      return next(new AppError('Person not found', 404));
    }

    const { password, ...rest } = req.body;

    if (password) {
      person.passwordHash = await bcrypt.hash(password, 12);
    }

    await person.update(rest);

    res.status(200).json({
      status: 'success',
      data: sanitize(person),
    });
  } catch (err) {
    next(err);
  }
};

const deletePerson = async (req, res, next) => {
  try {
    const person = await Person.findByPk(req.params.id);

    if (!person) {
      return next(new AppError('Person not found', 404));
    }

    await person.destroy();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPersons,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson,
};
