const { sequelize } = require('../config/database');
const Person = require('./person');
const Skill = require('./skill');
const Asset = require('./asset');
const WorkOrder = require('./workOrder');
const WorkActivity = require('./workActivity');
const Attachment = require('./attachment');
const Ticket = require('./ticket');

Person.belongsToMany(Skill, {
  through: 'person_skills',
  as: 'skills',
  foreignKey: 'personId',
});
Skill.belongsToMany(Person, {
  through: 'person_skills',
  as: 'persons',
  foreignKey: 'skillId',
});

Asset.belongsToMany(Skill, {
  through: 'asset_skills',
  as: 'skills',
  foreignKey: 'assetId',
});
Skill.belongsToMany(Asset, {
  through: 'asset_skills',
  as: 'assets',
  foreignKey: 'skillId',
});

WorkOrder.belongsToMany(Skill, {
  through: 'work_order_skills',
  as: 'skills',
  foreignKey: 'workOrderId',
});
Skill.belongsToMany(WorkOrder, {
  through: 'work_order_skills',
  as: 'workOrders',
  foreignKey: 'skillId',
});

WorkOrder.belongsToMany(Asset, {
  through: 'work_order_assets',
  as: 'assets',
  foreignKey: 'workOrderId',
});
Asset.belongsToMany(WorkOrder, {
  through: 'work_order_assets',
  as: 'workOrders',
  foreignKey: 'assetId',
});

WorkOrder.hasMany(WorkActivity, {
  as: 'activities',
  foreignKey: 'workOrderId',
});
WorkActivity.belongsTo(WorkOrder, {
  as: 'workOrder',
  foreignKey: 'workOrderId',
});

Asset.hasMany(WorkActivity, {
  as: 'activities',
  foreignKey: 'assetId',
});
WorkActivity.belongsTo(Asset, {
  as: 'asset',
  foreignKey: 'assetId',
});

Person.hasMany(WorkActivity, {
  as: 'activities',
  foreignKey: 'personId',
});
WorkActivity.belongsTo(Person, {
  as: 'person',
  foreignKey: 'personId',
});

WorkOrder.hasMany(Attachment, {
  as: 'attachments',
  foreignKey: 'sourceObjectId',
  constraints: false,
  scope: {
    sourceObjectType: 'WORK_ORDER',
  },
});
Attachment.belongsTo(WorkOrder, {
  as: 'workOrder',
  foreignKey: 'sourceObjectId',
  constraints: false,
});

Asset.hasMany(Attachment, {
  as: 'attachments',
  foreignKey: 'sourceObjectId',
  constraints: false,
  scope: {
    sourceObjectType: 'ASSET',
  },
});
Attachment.belongsTo(Asset, {
  as: 'asset',
  foreignKey: 'sourceObjectId',
  constraints: false,
});

Ticket.hasMany(Attachment, {
  as: 'attachments',
  foreignKey: 'sourceObjectId',
  constraints: false,
  scope: {
    sourceObjectType: 'TICKET',
  },
});
Attachment.belongsTo(Ticket, {
  as: 'ticket',
  foreignKey: 'sourceObjectId',
  constraints: false,
});

WorkActivity.hasMany(Attachment, {
  as: 'attachments',
  foreignKey: 'sourceObjectId',
  constraints: false,
  scope: {
    sourceObjectType: 'WORK_ACTIVITY',
  },
});
Attachment.belongsTo(WorkActivity, {
  as: 'activity',
  foreignKey: 'sourceObjectId',
  constraints: false,
});

WorkOrder.belongsTo(Person, {
  as: 'createdBy',
  foreignKey: 'createdById',
});
Person.hasMany(WorkOrder, {
  as: 'createdWorkOrders',
  foreignKey: 'createdById',
});

Ticket.belongsTo(Person, {
  as: 'createdBy',
  foreignKey: 'createdById',
});
Person.hasMany(Ticket, {
  as: 'createdTickets',
  foreignKey: 'createdById',
});

module.exports = {
  sequelize,
  Person,
  Skill,
  Asset,
  WorkOrder,
  WorkActivity,
  Attachment,
  Ticket,
};
