const { Op } = require('sequelize');
const { Asset, Attachment, Skill, WorkOrder } = require('../models');
const AppError = require('../utils/appError');

const includeRelations = [
  { model: Attachment, as: 'attachments' },
  { model: Skill, as: 'skills' },
  { model: WorkOrder, as: 'workOrders' },
];

const getAssets = async (req, res, next) => {
  try {
    const codesFilter = extractCodesFilter(req.query);

    const items = await Asset.findAll({
      include: includeRelations,
      where: codesFilter.length
        ? {
            code: codesFilter.length === 1 ? codesFilter[0] : { [Op.in]: codesFilter },
          }
        : undefined,
      order: [['name', 'ASC']],
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

const getAsset = async (req, res, next) => {
  try {
    const item = await Asset.findByPk(req.params.id, { include: includeRelations });

    if (!item) {
      return next(new AppError('Asset not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const createAsset = async (req, res, next) => {
  try {
    const { skillIds, ...payload } = req.body;

    const item = await Asset.create(payload);

    if (Array.isArray(skillIds)) {
      await item.setSkills(skillIds);
    }

    const created = await Asset.findByPk(item.id, { include: includeRelations });

    res.status(201).json({
      status: 'success',
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

const updateAsset = async (req, res, next) => {
  try {
    const { skillIds, ...payload } = req.body;

    const item = await Asset.findByPk(req.params.id);

    if (!item) {
      return next(new AppError('Asset not found', 404));
    }

    await item.update(payload);

    if (Array.isArray(skillIds)) {
      await item.setSkills(skillIds);
    }

    const updated = await Asset.findByPk(item.id, { include: includeRelations });

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const deleteAsset = async (req, res, next) => {
  try {
    const item = await Asset.findByPk(req.params.id);

    if (!item) {
      return next(new AppError('Asset not found', 404));
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
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
};

function extractCodesFilter(query) {
  const rawValues = [];

  const pushCodes = (value) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(pushCodes);
      return;
    }
    value
      .split(',')
      .map((code) => code.trim())
      .forEach((code) => {
        if (code) {
          rawValues.push(code);
        }
      });
  };

  pushCodes(query.codes);
  pushCodes(query.code);

  return [...new Set(rawValues)];
}
