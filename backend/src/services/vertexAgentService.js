const fetch = require('node-fetch');
const AppError = require('../utils/appError');
const { Ticket } = require('../models');

const log = (...args) => console.log('[AI Analysis]', ...args);

const {
  VERTEX_CLIENT_ID,
  VERTEX_CLIENT_SECRET,
  VERTEX_REFRESH_TOKEN,
  VERTEX_USER_ID,
  VERTEX_PROJECT_ID,
  VERTEX_LOCATION,
  VERTEX_ENGINE_ID,
} = process.env;

const ensureEnv = () => {
  const missing = [];
  if (!VERTEX_CLIENT_ID) missing.push('VERTEX_CLIENT_ID');
  if (!VERTEX_CLIENT_SECRET) missing.push('VERTEX_CLIENT_SECRET');
  if (!VERTEX_REFRESH_TOKEN) missing.push('VERTEX_REFRESH_TOKEN');
  if (!VERTEX_USER_ID) missing.push('VERTEX_USER_ID');
  if (missing.length) {
    throw new AppError(`Missing Vertex AI configuration: ${missing.join(', ')}`, 500);
  }
};

const getAccessToken = async () => {
  ensureEnv();

  log('Requesting Google API OAuth token...');
  const body = new URLSearchParams({
    client_id: VERTEX_CLIENT_ID,
    client_secret: VERTEX_CLIENT_SECRET,
    refresh_token: VERTEX_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(`Failed to fetch OAuth token: ${text}`, response.status || 500);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new AppError('OAuth response missing access_token', 500);
  }

  log('Google API OAuth token acquired');
  return data.access_token;
};

const buildBaseUrl = () =>
  `https://us-west1-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_LOCATION}/reasoningEngines/${VERTEX_ENGINE_ID}`;

const createSession = async (accessToken) => {
  ensureEnv();
  log('Creating Vertex session...');
  const response = await fetch(`${buildBaseUrl()}:query`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      classMethod: 'create_session',
      input: {
        user_id: VERTEX_USER_ID,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(`Failed to create Vertex session: ${text}`, response.status || 500);
  }

  const payload = await response.json();
  const sessionId = payload?.output?.id;
  if (!sessionId) {
    throw new AppError('Vertex session response missing id', 500);
  }

  log('Vertex session created:', sessionId);
  return sessionId;
};

const deleteSession = async (accessToken, sessionId) => {
  if (!sessionId) return;
  ensureEnv();
  log('Deleting Vertex session:', sessionId);
  const response = await fetch(`${buildBaseUrl()}:query`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      classMethod: 'delete_session',
      input: {
        user_id: VERTEX_USER_ID,
        session_id: sessionId,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(`Failed to delete Vertex session: ${text}`, response.status || 500);
  }

  log('Vertex session deleted:', sessionId);
};

const extractTextFromPayload = (payload) => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;

  const output = payload.output;
  if (typeof output === 'string') return output;
  if (output?.message) return output.message;
  if (output?.text) return output.text;
  if (typeof output?.content === 'string') return output.content;

  if (Array.isArray(output?.content)) {
    return output.content
      .map((part) => (typeof part === 'string' ? part : part?.text))
      .filter(Boolean)
      .join('\n');
  }

  if (payload?.content?.parts) {
    return payload.content.parts
      .map((part) => part?.text)
      .filter(Boolean)
      .join('\n');
  }

  if (payload?.actions?.state_delta) {
    const deltaValues = Object.values(payload.actions.state_delta).filter(Boolean);
    if (deltaValues.length) {
      return deltaValues.join('\n');
    }
  }

  if (payload?.text) return payload.text;

  return '';
};

const streamAnalysis = async ({ accessToken, sessionId, description }) => {
  ensureEnv();
  log("Starting Agentic flow ...")
  log('Starting Google Vertex stream for session:', sessionId);
  const response = await fetch(`${buildBaseUrl()}:streamQuery?alt=sse`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      accept: 'text/event-stream',
    },
    body: JSON.stringify({
      class_method: 'async_stream_query',
      input: {
        user_id: VERTEX_USER_ID,
        session_id: sessionId,
        message: `Analyze this weather event and predict which assets are at risk:\n\n${description}`,
      },
    }),
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    throw new AppError(`Vertex streaming call failed: ${text}`, response.status || 500);
  }

  let finalText = '';
  let latestText = '';
  let jsonBuffer = '';

  try {
    for await (const chunk of response.body) {
      const lines = chunk.toString('utf8').replace(/\r\n/g, '\n').split('\n');
      log('Stream chunk:', lines);

      const chunkComplete = !lines[lines.length - 1];
      const payloadFragment = lines
        .filter((line) => typeof line === 'string' && line.trim())
        .join('');

      if (!payloadFragment) {
        continue;
      }

      jsonBuffer += payloadFragment;

      if (!chunkComplete) {
        continue;
      }

      let packet;
      try {
        const candidate = jsonBuffer.trim().replace(/^'+|'+$/g, '');
        packet = JSON.parse(candidate);
        jsonBuffer = '';
      } catch (err) {
        log('Stream JSON parse error:', err.message);
        continue;
      }

      log('Stream JSON packet:', packet);

      const parts = Array.isArray(packet?.content?.parts) ? packet.content.parts : [];
      parts.forEach((part) => {
        if (part?.text) {
          log('Stream parts text:', part.text);
          latestText = part.text;
          finalText = `${finalText}${part.text}\n`;
        }
      });

      const textOutput = extractTextFromPayload(packet);
      if (textOutput) {
        log('Stream text output:', textOutput);
        latestText = textOutput;
        finalText = `${finalText}${textOutput}\n`;
      }

      if (packet?.event === 'end') {
        log('Stream end event received');
      }
    }
  } catch (err) {
    log('Vertex stream error:', err.message);
    throw new AppError(`Vertex streaming error: ${err.message}`, 500);
  }

  log('===============================================================================================================')
  const resolvedText = (latestText || finalText).trim();
  log('Final stream text:', resolvedText);
  log('=============================================================================================================== END')

  log('Vertex stream complete for session:', sessionId);
    return resolvedText;
};

const updateTicketNotesWithAnalysis = async (ticketId, analysis) => {
  if (!ticketId) return;
  const ticket = await Ticket.findByPk(ticketId);
  if (!ticket) {
    log('Ticket not found while persisting AI notes', ticketId);
    return;
  }

  const trimmed = analysis?.trim() || 'AI agent did not return any insights.';
  const aiNote = `AI Generated Insight:\n${trimmed}`;

  await ticket.update({ notes: aiNote });
  log('Ticket notes updated with AI analysis', { ticketId, noteLength: aiNote.length });
};

const analyzeWeatherDescription = async (ticketId, description) => {
  let accessToken;
  let sessionId;

  try {
    log('Analyzing weather description (chars):', description?.length ?? 0);
    accessToken = await getAccessToken();
    sessionId = await createSession(accessToken);
    const analysis = await streamAnalysis({ accessToken, sessionId, description });
    log('Analysis complete for session:', sessionId);
    if (ticketId) {
      await updateTicketNotesWithAnalysis(ticketId, analysis);
    }
    return analysis;
  } finally {
    if (accessToken && sessionId) {
      deleteSession(accessToken, sessionId).catch((error) => {
        console.error('[AI Analysis] Failed to delete Vertex session', error.message);
      });
    }
  }
};

module.exports = {
  getAccessToken,
  createSession,
  streamAnalysis,
  deleteSession,
  analyzeWeatherDescription,
};
