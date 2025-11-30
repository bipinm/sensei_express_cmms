const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  serialNumber: {
    type: DataTypes.STRING(80),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
  },
  installationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_SERVICE'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  },
}, {
  tableName: 'assets',
});

module.exports = Asset;
