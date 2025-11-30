const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Person } = require('../models');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

const sanitizePerson = (person) => {
  if (!person) return null;
  const { passwordHash, ...rest } = person.get({ plain: true });
  return rest;
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError('Please provide username and password', 400));
    }

    const user = await Person.findOne({ where: { username } });

    if (!user || !user.isActive) {
      return next(new AppError('User not found or not active', 401));
    }

    const isMatch = password === user.passwordHash;  //await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return next(new AppError('Incorrect username or password ::' + password + '::' + user.passwordHash, 401));
    }

    const token = signToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
      user: sanitizePerson(user),
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await Person.findByPk(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      user: sanitizePerson(user),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getMe,
};
