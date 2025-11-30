const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Person = sequelize.define('Person', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('ADMIN', 'TECHNICIAN', 'USER'),
    allowNull: false,
    defaultValue: 'TECHNICIAN',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'persons',
});

module.exports = Person;
