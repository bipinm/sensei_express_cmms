const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { Person } = require('../models');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await Person.findByPk(decoded.id);
    if (!currentUser || !currentUser.isActive) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.type)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

module.exports = {
  protect,
  restrictTo,
};
