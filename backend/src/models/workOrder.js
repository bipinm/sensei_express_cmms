const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkOrder = sequelize.define('WorkOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'id'
  },
  status: {
    type: DataTypes.ENUM('NEW', 'PLANNED', 'SCHEDULED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'NEW',
  },
  type: {
    type: DataTypes.ENUM('CORRECTIVE', 'PREVENTIVE', 'MAINTENANCE', 'CALIBRATION', 'INSPECTION', 'OTHER'),
    allowNull: false,
    defaultValue: 'OTHER',
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
    defaultValue: 'MEDIUM',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  origin: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
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
  earliestStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  latestStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  // Model options
  timestamps: true,
  tableName: 'work_orders',
  omitNull: true
});

module.exports = WorkOrder;
