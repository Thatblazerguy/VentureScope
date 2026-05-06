const express = require('express');
const { Readable } = require('stream');
const { requireSupabaseSession } = require('../middleware/auth');
const { openClawCopilotUrl, soulPath } = require('../config');
const { loadSoulMemory } = require('../lib/soul');
const { getSupabaseClient } = require('../lib/supabase');

const router = express.Router();

async function buildSoulContext() {
  // 1. Load SOUL profile
  let domains = [];
  let riskAppetite = 'medium';
  try {
    const soul = loadSoulMemory(soulPath);
    const userProfile = soul?.profile?.user_profile || {};
    domains = userProfile.domains || [];
    riskAppetite = userProfile.risk_appetite || 'medium';
  } catch (err) {
    console.error('[Copilot] Failed to load SOUL memory:', err.message);
  }

  // 2. Fetch top opportunities from Supabase
  let opportunities = [];
  try {
    const supabase = getSupabaseClient();
    if (supabase && domains.length > 0) {
      const { data } = await supabase
        .from('opportunities')
        .select('title, score, summary')
        .in('title', domains)
        .order('score', { ascending: false })
        .limit(5);
      opportunities = data || [];
    }
  } catch (err) {
    console.error('[Copilot] Failed to fetch opportunities:', err.message);
  }

  // 3. Format as a clear, dense context block for the LLM
  const domainsStr = domains.length > 0 ? domains.join(', ') : 'None set';
  const oppsStr = opportunities.length > 0
    ? opportunities
        .map(o => `  - ${o.title}: Gap Score ${o.score}/100 — ${o.summary || 'No summary'}`)
        .join('\n')
    : '  - No opportunity data available yet.';

  return `=== USER SOUL CONTEXT ===
Tracked Domains: ${domainsStr}
Risk Appetite: ${riskAppetite}

Top Opportunities (live from pipeline):
${oppsStr}
=========================`;
}

router.post('/', requireSupabaseSession, async (req, res) => {
  if (!openClawCopilotUrl) {
    return res.status(503).json({
      error: 'OpenClaw copilot proxy is not configured',
    });
  }

  // Fetch SOUL context and inject it before forwarding to OpenClaw
  const soulContext = await buildSoulContext();

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
      soulContext,  // <-- injected SOUL + opportunity context
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