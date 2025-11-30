const { WorkOrder, Asset, WorkActivity, Attachment, Skill, Person, sequelize } = require('../models');
const AppError = require('../utils/appError');

const includeRelations = [
  { model: Asset, as: 'assets' },
  { model: WorkActivity, as: 'activities', include: [{ model: Person, as: 'person', attributes: { exclude: ['passwordHash'] } }] },
  { model: Attachment, as: 'attachments' },
  { model: Skill, as: 'skills' },
  { model: Person, as: 'createdBy', attributes: { exclude: ['passwordHash'] } },
];

const getWorkOrders = async (req, res, next) => {
  try {
    const workOrders = await WorkOrder.findAll({
      include: includeRelations,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      results: workOrders.length,
      data: workOrders,
    });
  } catch (err) {
    next(err);
  }
};

const getWorkOrder = async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findByPk(req.params.id, {
      include: includeRelations,
    });

    if (!workOrder) {
      return next(new AppError('Work order not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: workOrder,
    });
  } catch (err) {
    next(err);
  }
};

const createWorkOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { assetIds, skillIds, ...payload } = req.body;

    if (req.user) {
      payload.createdById = req.user.id;
    }

    // Validate assetIds exist
    if (Array.isArray(assetIds) && assetIds.length > 0) {
      const assets = await Asset.findAll({
        where: { id: assetIds },
        transaction
      });
      if (assets.length !== assetIds.length) {
        const foundIds = assets.map(asset => asset.id);
        const missingIds = assetIds.filter(id => !foundIds.includes(id));
        throw new AppError(`One or more assets not found: ${missingIds.join(', ')}`, 400);
      }
    }

    // Validate skillIds exist
    if (Array.isArray(skillIds) && skillIds.length > 0) {
      const skills = await Skill.findAll({
        where: { id: skillIds },
        transaction
      });
      if (skills.length !== skillIds.length) {
        const foundIds = skills.map(skill => skill.id);
        const missingIds = skillIds.filter(id => !foundIds.includes(id));
        throw new AppError(`One or more skills not found: ${missingIds.join(', ')}`, 400);
      }
    }

    // Explicitly exclude ID to let the database handle auto-increment
    const { id, ...workOrderData } = payload;
    const workOrder = await WorkOrder.create(workOrderData, { 
      transaction,
      returning: true,
      plain: true
    });

    if (Array.isArray(assetIds)) {
      await workOrder.setAssets(assetIds, { transaction });
    }

    if (Array.isArray(skillIds)) {
      await workOrder.setSkills(skillIds, { transaction });
    }

    await transaction.commit();

    const created = await WorkOrder.findByPk(workOrder.id, { 
      include: includeRelations 
    });

    res.status(201).json({
      status: 'success',
      data: created,
    });
  } catch (err) {
    await transaction.rollback();
    
    console.error('Error in createWorkOrder:', {
      error: err.message,
      validationErrors: err.errors?.map(e => `${e.path}: ${e.message}`),
      stack: err.stack,
      requestBody: req.body,
      userId: req.user?.id
    });
    
    if (err instanceof AppError) {
      return next(err);
    }
    
    if (err.name === 'SequelizeUniqueConstraintError' || 
        err.name === 'SequelizeValidationError' ||
        err.name === 'SequelizeForeignKeyConstraintError') {
      const errorMessage = err.errors?.map(e => e.message).join('; ') || err.message;
      return next(new AppError(`Validation error: ${errorMessage}`, 400));
    }
    
    next(err);
  }
};

const updateWorkOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { assetIds, skillIds, ...payload } = req.body;

    const workOrder = await WorkOrder.findByPk(req.params.id, { transaction });
    if (!workOrder) {
      await transaction.rollback();
      return next(new AppError('Work order not found', 404));
    }

    // Validate assetIds exist if provided
    if (Array.isArray(assetIds)) {
      const assets = await Asset.findAll({
        where: { id: assetIds },
        transaction
      });
      if (assets.length !== assetIds.length) {
        const foundIds = assets.map(asset => asset.id);
        const missingIds = assetIds.filter(id => !foundIds.includes(id));
        throw new AppError(`One or more assets not found: ${missingIds.join(', ')}`, 400);
      }
    }

    // Validate skillIds exist if provided
    if (Array.isArray(skillIds)) {
      const skills = await Skill.findAll({
        where: { id: skillIds },
        transaction
      });
      if (skills.length !== skillIds.length) {
        const foundIds = skills.map(skill => skill.id);
        const missingIds = skillIds.filter(id => !foundIds.includes(id));
        throw new AppError(`One or more skills not found: ${missingIds.join(', ')}`, 400);
      }
    }

    await workOrder.update(payload, { transaction });

    if (Array.isArray(assetIds)) {
      await workOrder.setAssets(assetIds, { transaction });
    }

    if (Array.isArray(skillIds)) {
      await workOrder.setSkills(skillIds, { transaction });
    }

    await transaction.commit();

    const updated = await WorkOrder.findByPk(workOrder.id, { 
      include: includeRelations 
    });

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    await transaction.rollback();
    
    console.error('Error in updateWorkOrder:', {
      workOrderId: req.params.id,
      error: err.message,
      validationErrors: err.errors?.map(e => `${e.path}: ${e.message}`),
      stack: err.stack,
      requestBody: req.body,
      userId: req.user?.id
    });
    
    if (err instanceof AppError) {
      return next(err);
    }
    
    if (err.name === 'SequelizeUniqueConstraintError' || 
        err.name === 'SequelizeValidationError' ||
        err.name === 'SequelizeForeignKeyConstraintError') {
      const errorMessage = err.errors?.map(e => e.message).join('; ') || err.message;
      return next(new AppError(`Validation error: ${errorMessage}`, 400));
    }
    
    next(err);
  }
};

const deleteWorkOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const workOrder = await WorkOrder.findByPk(req.params.id, { transaction });
    if (!workOrder) {
      await transaction.rollback();
      return next(new AppError('Work order not found', 404));
    }

    // Check for existing activities before deletion
    const activitiesCount = await WorkActivity.count({
      where: { workOrderId: workOrder.id },
      transaction
    });

    if (activitiesCount > 0) {
      throw new AppError('Cannot delete work order with associated activities', 400);
    }

    // Remove associations first
    await workOrder.setAssets([], { transaction });
    await workOrder.setSkills([], { transaction });
    
    // Delete the work order
    await workOrder.destroy({ transaction });
    
    await transaction.commit();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    await transaction.rollback();
    
    console.error('Error in deleteWorkOrder:', {
      workOrderId: req.params.id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id
    });
    
    if (err instanceof AppError) {
      return next(err);
    }
    
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return next(new AppError('Cannot delete work order with associated records', 400));
    }
    
    next(err);
  }
};

module.exports = {
  getWorkOrders,
  getWorkOrder,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
};
