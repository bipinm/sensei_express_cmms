const { Ticket, Attachment, Person } = require('../models');
const AppError = require('../utils/appError');
const { analyzeWeatherDescription } = require('../services/vertexAgentService');
const { analyzeDamageAttachment } = require('../services/localAgentService');

const includeRelations = [
  { model: Attachment, as: 'attachments' },
  { model: Person, as: 'createdBy', attributes: { exclude: ['passwordHash'] } },
];

const getTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.findAll({
      include: includeRelations,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
};

const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, { include: includeRelations });

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

const createTicket = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (req.user) {
      payload.createdById = req.user.id;
    }

    const ticket = await Ticket.create(payload);

    const created = await Ticket.findByPk(ticket.id, { include: includeRelations });

    res.status(201).json({
      status: 'success',
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    await ticket.update(req.body);

    const updated = await Ticket.findByPk(ticket.id, { include: includeRelations });

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    await ticket.destroy();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

const analyzeTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, { include: includeRelations });

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    const type = (ticket.type || '').toLowerCase();
    const subType = (ticket.subType || '').toLowerCase();

    let analysis;

    if (subType === 'weather') {
      if (!ticket.description) {
        return next(new AppError('Ticket description is required for weather analysis', 400));
      }
      analysis = await analyzeWeatherDescription(ticket.id, ticket.description);
    } else if (type === 'issue' && subType === 'damage') {
      const attachment = ticket.attachments?.find((att) => att?.srcPath || att?.url);
      if (!attachment) {
        return next(new AppError('Damage analysis requires at least one attachment', 400));
      }
      analysis = await analyzeDamageAttachment({
        ticketId: ticket.id,
        attachment,
        description: ticket.description,
      });
    } else {
      return next(new AppError('AI analysis is only available for Weather or Issue/Damage tickets', 400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        analysis,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  analyzeTicket,
};
