const express = require('express');
const { Readable } = require('stream');
const { requireSupabaseSession } = require('../middleware/auth');
const { openClawCopilotUrl } = require('../config');

const router = express.Router();

router.post('/', requireSupabaseSession, async (req, res) => {
  if (!openClawCopilotUrl) {
    return res.status(503).json({
      error: 'OpenClaw copilot proxy is not configured',
    });
  }

  const upstreamResponse = await fetch(openClawCopilotUrl, {
    method: 'POST',
    headers: {
      'content-type': req.headers['content-type'] || 'application/json',
      accept: req.headers.accept || 'text/event-stream, application/json',
      authorization: req.headers.authorization || '',
      'x-user-id': req.user?.id || '',
    },
    body: JSON.stringify({
      ...req.body,
      user: req.user,
    }),
  });

  res.status(upstreamResponse.status);

  const contentType = upstreamResponse.headers.get('content-type');
  if (contentType) {
    res.setHeader('content-type', contentType);
  }

  if (!upstreamResponse.body) {
    const payload = await upstreamResponse.text();
    return res.send(payload);
  }

  Readable.fromWeb(upstreamResponse.body).pipe(res);
  return undefined;
});

module.exports = router;