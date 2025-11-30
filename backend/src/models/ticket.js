const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ticketId: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('CREATED', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
    allowNull: false,
    defaultValue: 'CREATED',
  },
  type: {
    type: DataTypes.ENUM('INCIDENT', 'ISSUE', 'REQUEST', 'PROBLEM', 'OTHER'),
    allowNull: false,
    defaultValue: 'INCIDENT',
  },
  subType: {
    type: DataTypes.STRING(30),
    allowNull: true,
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
  location: {
    type: DataTypes.STRING(160),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'tickets',
});

module.exports = Ticket;
