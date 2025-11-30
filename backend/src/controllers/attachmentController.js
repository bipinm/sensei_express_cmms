const { Attachment, WorkOrder, Asset, Ticket, WorkActivity } = require('../models');
const AppError = require('../utils/appError');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const includeRelations = [
  { model: WorkOrder, as: 'workOrder' },
  { model: Asset, as: 'asset' },
  { model: Ticket, as: 'ticket' },
  { model: WorkActivity, as: 'activity' },
];

const SUPPORTED_TYPES = {
  WORK_ORDER: WorkOrder,
  ASSET: Asset,
  TICKET: Ticket,
  WORK_ACTIVITY: WorkActivity,
};

const validateSource = async (type, id) => {
  if (!type || !id) {
    throw new AppError('sourceObjectType and sourceObjectId are required', 400);
  }

  const upperType = String(type).toUpperCase();
  const numericId = Number(id);

  if (!SUPPORTED_TYPES[upperType]) {
    throw new AppError(`Unsupported sourceObjectType: ${type}`, 400);
  }

  if (!Number.isFinite(numericId)) {
    throw new AppError('sourceObjectId must be a number', 400);
  }

  const model = SUPPORTED_TYPES[upperType];
  const target = await model.findByPk(numericId);
  if (!target) {
    throw new AppError(`${upperType} with ID ${numericId} not found`, 400);
  }

  return { sourceObjectType: upperType, sourceObjectId: numericId };
};

const getAttachments = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.sourceObjectType) {
      where.sourceObjectType = String(req.query.sourceObjectType).toUpperCase();
    }
    if (req.query.sourceObjectId) {
      where.sourceObjectId = req.query.sourceObjectId;
    }

    const items = await Attachment.findAll({
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

const getAttachment = async (req, res, next) => {
  try {
    const item = await Attachment.findByPk(req.params.id, { include: includeRelations });

    if (!item) {
      return next(new AppError('Attachment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const createAttachment = async (req, res, next) => {
  try {
    let payload = { ...req.body };
    if (payload.sourceObjectType || payload.sourceObjectId) {
      const validated = await validateSource(payload.sourceObjectType, payload.sourceObjectId);
      payload = { ...payload, ...validated };
    }

    const item = await Attachment.create(payload);

    const created = await Attachment.findByPk(item.id, { include: includeRelations });

    res.status(201).json({
      status: 'success',
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    console.log('File upload received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const relativePath = path
      .relative(DATA_DIR, req.file.path)
      .replace(/\\/g, '/');

    const { sourceObjectType, sourceObjectId, name, type, notes } = req.body;

    const { sourceObjectType: validatedType, sourceObjectId: validatedId } =
      await validateSource(sourceObjectType, sourceObjectId);
    
    const attachmentData = {
      name: name || req.file.originalname,
      type: type || req.file.mimetype,
      notes: notes || null,
      sourceObjectType: validatedType,
      sourceObjectId: validatedId,
      srcPath: relativePath,
      url: `/data/${relativePath}`,
    };

    console.log('Creating attachment with data:', JSON.stringify(attachmentData, null, 2));

    const item = await Attachment.create(attachmentData);
    console.log('Attachment created successfully with ID:', item.id);

    const created = await Attachment.findByPk(item.id, { 
      include: includeRelations 
    });

    res.status(201).json({
      status: 'success',
      data: created,
    });
  } catch (err) {
    console.error('Error in uploadAttachment:', {
      error: err.message,
      validationErrors: err.errors?.map(e => `${e.path}: ${e.message}`),
      stack: err.stack,
      requestBody: req.body,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      } : 'No file uploaded'
    });
    
    if (err.name === 'SequelizeUniqueConstraintError' || 
        err.name === 'SequelizeValidationError' ||
        err.name === 'SequelizeForeignKeyConstraintError') {
      const errorMessage = err.errors?.map(e => e.message).join('; ') || err.message;
      return next(new AppError(`Validation error: ${errorMessage}`, 400));
    }
    next(err);
  }
};

const updateAttachment = async (req, res, next) => {
  try {
    const item = await Attachment.findByPk(req.params.id);

    if (!item) {
      return next(new AppError('Attachment not found', 404));
    }

    let payload = { ...req.body };
    if (payload.sourceObjectType || payload.sourceObjectId) {
      const validated = await validateSource(
        payload.sourceObjectType ?? item.sourceObjectType,
        payload.sourceObjectId ?? item.sourceObjectId
      );
      payload = { ...payload, ...validated };
    }

    await item.update(payload);

    const updated = await Attachment.findByPk(item.id, { include: includeRelations });

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const deleteAttachment = async (req, res, next) => {
  try {
    const item = await Attachment.findByPk(req.params.id);

    if (!item) {
      return next(new AppError('Attachment not found', 404));
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
  getAttachments,
  getAttachment,
  createAttachment,
  updateAttachment,
  deleteAttachment,
  uploadAttachment,
};
