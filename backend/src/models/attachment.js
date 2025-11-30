const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(80),
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING(512),
    allowNull: true,
  },
  srcPath: {
    type: DataTypes.STRING(512),
    allowNull: false,
  },
  sourceObjectType: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  sourceObjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'attachments',
});

module.exports = Attachment;
