const fetch = require('node-fetch');
const { randomUUID } = require('crypto');
const AppError = require('../utils/appError');
const { Ticket } = require('../models');

const {
  LOCAL_AGENT_BASE_URL,
  LOCAL_AGENT_APP_NAME,
  LOCAL_AGENT_USER_ID = 'u_123',
  LOCAL_AGENT_PROMPT_PREFIX = 'Analyse the image at path:',
  LOCAL_AGENT_IMAGE_BASE_URL,
} = process.env;

const log = (...args) => console.log('[Local Agent]', ...args);

const ensureEnv = () => {
  if (!LOCAL_AGENT_BASE_URL) {
    throw new AppError('Missing LOCAL_AGENT_BASE_URL configuration', 500);
  }
  if (!LOCAL_AGENT_APP_NAME) {
    throw new AppError('Missing LOCAL_AGENT_APP_NAME configuration', 500);
  }
};

const buildSessionUrl = (userId, sessionId) =>
  `${LOCAL_AGENT_BASE_URL}/apps/${LOCAL_AGENT_APP_NAME}/users/${userId}/sessions/${sessionId}`;

const createSession = async () => {
  ensureEnv();
  const userId = LOCAL_AGENT_USER_ID;
  const sessionId = `s_${randomUUID()}`;
  const response = await fetch(buildSessionUrl(userId, sessionId), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(`Failed to create local agent session: ${text}`, response.status || 500);
  }

  log('Local agent session created:', sessionId);
  return { userId, sessionId };
};

const deleteSession = async ({ userId, sessionId }) => {
  if (!sessionId) return;
  ensureEnv();
  await fetch(buildSessionUrl(userId, sessionId), {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
  }).catch((err) => {
    log('Failed to delete local session', sessionId, err.message);
  });
};

const normalizeBase = (base) => base?.replace(/\/$/, '') || '';
const IMAGE_BASE = normalizeBase(LOCAL_AGENT_IMAGE_BASE_URL);

const toAbsoluteUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!IMAGE_BASE) return null;
  return `${IMAGE_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};

const resolveAttachmentUrl = (attachment) => {
  if (!attachment) return null;
  const fromUrl = toAbsoluteUrl(attachment.url);
  if (fromUrl) return fromUrl;
  return toAbsoluteUrl(attachment.srcPath);
};

const runImageAnalysis = async ({ userId, sessionId, attachment, description }) => {
  ensureEnv();
  const imageUrl = resolveAttachmentUrl(attachment);
  if (!imageUrl) {
    throw new AppError('Attachment is missing a publicly reachable URL for analysis', 400);
  }
  const prompt = `${LOCAL_AGENT_PROMPT_PREFIX} ${imageUrl}\nDescription: ${description || 'No description provided.'}`;
  const runPayload = {
    appName: LOCAL_AGENT_APP_NAME,
    userId,
    sessionId,
    newMessage: {
      role: 'user',
      parts: [{ text: prompt }],
    },
  };

  const response = await fetch(`${LOCAL_AGENT_BASE_URL}/run`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(runPayload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(`Local agent run failed: ${text}`, response.status || 500);
  }

  const data = await response.json();
  const payload = Array.isArray(data) ? data[data.length - 1] : data;
  log('Local agent payload', payload);
  return payload;
};

const extractInsight = (payload) => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;

  log('========================================================================================================================================')
  log('Local agent payload EXTRACT ========> ', payload);
  log('========================================================================================================================================')
  
  const collectTextParts = (parts) =>
    parts
      .map((part) => part?.text || part?.function_response?.response?.result || part?.function_response?.response)
      .filter(Boolean)
      .join('\n')
      .trim();

  const parts = payload?.content?.parts;
  if (Array.isArray(parts) && parts.length) {
    const text = collectTextParts(parts);
    if (text) return text;
  }

  const stateDeltaText = payload?.actions?.stateDelta?.input_image_path;
  if (stateDeltaText) {
    return stateDeltaText.trim();
  }

  if (payload?.result) {
    return typeof payload.result === 'string' ? payload.result : JSON.stringify(payload.result, null, 2);
  }

  if (payload?.response?.result) {
    return typeof payload.response.result === 'string'
      ? payload.response.result
      : JSON.stringify(payload.response.result, null, 2);
  }

  return JSON.stringify(payload, null, 2);
};

const updateTicketNotes = async (ticketId, insight) => {
  if (!ticketId) return;
  const ticket = await Ticket.findByPk(ticketId);
  if (!ticket) {
    log('Ticket not found while persisting local insight', ticketId);
    return;
  }

  const trimmed = insight?.trim() || 'Local agent did not return any insight.';
  const aiNote = `AI Image Insight:\n${trimmed}`;
  await ticket.update({ notes: aiNote });
  log('Ticket notes updated with local agent insight', { ticketId, noteLength: aiNote.length });
};

const analyzeDamageAttachment = async ({ ticketId, attachment, description }) => {
  if (!attachment) {
    throw new AppError('A valid attachment is required for image analysis', 400);
  }

  let session;
  try {
    session = await createSession();
    const payload = await runImageAnalysis({ ...session, attachment, description });
    const insight = extractInsight(payload);
    await updateTicketNotes(ticketId, insight);
    return insight;
  } finally {
    if (session) {
      await deleteSession(session);
    }
  }
};

module.exports = {
  analyzeDamageAttachment,
};
