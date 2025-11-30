const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkActivity = sequelize.define('WorkActivity', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  plannedStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  plannedEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
    defaultValue: 'MEDIUM',
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'assets',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  problemType: {
    type: DataTypes.ENUM('MECHANICAL', 'ELECTRICAL', 'ELECTRONIC', 'SOFTWARE', 'INSPECTION', 'SAFETY', 'CALIBRATION', 'OTHER'),
    allowNull: false,
    defaultValue: 'OTHER',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
}, {
  tableName: 'work_activities',
});

module.exports = WorkActivity;
