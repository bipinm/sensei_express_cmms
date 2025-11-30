const { WorkActivity, WorkOrder, Person, Asset, Attachment } = require('../models');
const AppError = require('../utils/appError');

const includeRelations = [
  { model: WorkOrder, as: 'workOrder' },
  { model: Person, as: 'person', attributes: { exclude: ['passwordHash'] } },
  { model: Asset, as: 'asset' },
  { model: Attachment, as: 'attachments' },
];

const getWorkActivities = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.workOrderId) {
      where.workOrderId = req.query.workOrderId;
    }

    const items = await WorkActivity.findAll({
      where,
      include: includeRelations,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      results: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

const getWorkActivity = async (req, res, next) => {
  try {
    const item = await WorkActivity.findByPk(req.params.id, { include: includeRelations });

    if (!item) {
      return next(new AppError('Work activity not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const createWorkActivity = async (req, res, next) => {
  try {
    const payload = req.body;

    if (payload.assetId) {
      const asset = await Asset.findByPk(payload.assetId);
      if (!asset) {
        return next(new AppError('Asset not found', 400));
      }
    }

    const item = await WorkActivity.create(payload);

    const created = await WorkActivity.findByPk(item.id, { include: includeRelations });

    res.status(201).json({
      status: 'success',
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

const updateWorkActivity = async (req, res, next) => {
  try {
    const item = await WorkActivity.findByPk(req.params.id);

    if (!item) {
      return next(new AppError('Work activity not found', 404));
    }

    if (req.body.assetId) {
      const asset = await Asset.findByPk(req.body.assetId);
      if (!asset) {
        return next(new AppError('Asset not found', 400));
      }
    }

    await item.update(req.body);

    const updated = await WorkActivity.findByPk(item.id, { include: includeRelations });

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const deleteWorkActivity = async (req, res, next) => {
  try {
    const item = await WorkActivity.findByPk(req.params.id);

    if (!item) {
      return next(new AppError('Work activity not found', 404));
    }

    await item.destroy();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWorkActivities,
  getWorkActivity,
  createWorkActivity,
  updateWorkActivity,
  deleteWorkActivity,
};
