const express = require('express');
const router  = express.Router();

/* ── In-memory cache (5 min TTL) ─────────────────────────────────────────── */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map();             // query → { ts, data }

function getCached(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL_MS) { cache.delete(key); return null; }
  return hit.data;
}
function setCache(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

/* ── Sleep helper ─────────────────────────────────────────────────────────── */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── Semantic Scholar (primary) ───────────────────────────────────────────── */
const S2_BASE  = 'https://api.semanticscholar.org/graph/v1/paper/search';
const S2_FIELDS = 'title,authors,year,abstract,citationCount,externalIds';

async function fetchSemanticScholar(query, limit) {
  const url = `${S2_BASE}?query=${encodeURIComponent(query)}&fields=${S2_FIELDS}&limit=${limit}&offset=0`;
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (res.status === 429) {
        // Rate limited — wait before retry
        const retryAfter = Number(res.headers.get('Retry-After') || 2) * 1000;
        console.warn(`[papers] S2 rate-limited (attempt ${attempt}), waiting ${retryAfter}ms`);
        if (attempt < MAX_ATTEMPTS) { await sleep(retryAfter); continue; }
        return null; // exhausted retries
      }

      if (!res.ok) {
        console.warn(`[papers] S2 returned ${res.status} on attempt ${attempt}`);
        if (attempt < MAX_ATTEMPTS) { await sleep(800 * attempt); continue; }
        return null;
      }

      const json = await res.json();
      const papers = (json.data || [])
        .filter(p => p.title)
        .map(p => ({
          id:            p.paperId || '',
          title:         p.title,
          authors:       (p.authors || []).slice(0, 3).map(a => a.name),
          year:          p.year || null,
          abstract:      p.abstract || null,
          citationCount: p.citationCount ?? null,
          url:           p.externalIds?.DOI
                           ? `https://doi.org/${p.externalIds.DOI}`
                           : `https://www.semanticscholar.org/paper/${p.paperId}`,
          source:        'Semantic Scholar',
        }));

      return papers.length ? papers : null; // fall through if empty
    } catch (err) {
      console.warn(`[papers] S2 fetch error (attempt ${attempt}):`, err.message);
      if (attempt < MAX_ATTEMPTS) await sleep(800 * attempt);
    }
  }
  return null;
}

/* ── arXiv (fallback) ─────────────────────────────────────────────────────── */
const ARXIV_BASE = 'https://export.arxiv.org/api/query';

function parseArxiv(xml) {
  // Minimal XML extraction without a full parser
  const entries = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRe.exec(xml)) !== null) {
    const block = match[1];
    const get   = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].replace(/<[^>]+>/g, '').trim() : null;
    };

    const id      = get('id');
    const title   = get('title')?.replace(/\s+/g, ' ') || '';
    const summary = get('summary')?.replace(/\s+/g, ' ') || null;
    const year    = (get('published') || '').slice(0, 4) || null;

    const authorRe = /<author>([\s\S]*?)<\/author>/g;
    const authors  = [];
    let am;
    while ((am = authorRe.exec(block)) !== null) {
      const name = am[1].match(/<name>([^<]+)<\/name>/);
      if (name) authors.push(name[1].trim());
    }

    if (title) {
      entries.push({
        id:            id || '',
        title,
        authors:       authors.slice(0, 3),
        year:          year ? Number(year) : null,
        abstract:      summary,
        citationCount: null,
        url:           id || `https://arxiv.org/search/?query=${encodeURIComponent(title)}`,
        source:        'arXiv',
      });
    }
  }
  return entries;
}

async function fetchArxiv(query, limit) {
  const url = `${ARXIV_BASE}?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}&sortBy=submittedDate&sortOrder=descending`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`arXiv returned ${res.status}`);
    const xml     = await res.text();
    const entries = parseArxiv(xml);
    return entries.length ? entries : null;
  } catch (err) {
    console.warn('[papers] arXiv fetch error:', err.message);
    return null;
  }
}

/* ── Route handler ─────────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  const query = (req.query.query || '').trim();
  const limit = Math.min(Number(req.query.limit) || 6, 10);

  if (!query) {
    return res.status(400).json({ error: 'Missing required query parameter' });
  }

  const cacheKey = `${query}::${limit}`;

  // ── Cache hit ──
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[papers] cache hit for "${query}"`);
    return res.json({ data: cached, source: cached[0]?.source || 'cache' });
  }

  // ── Try Semantic Scholar first, arXiv as fallback ──
  console.log(`[papers] fetching papers for "${query}"`);
  let papers = await fetchSemanticScholar(query, limit);

  if (!papers) {
    console.log(`[papers] falling back to arXiv for "${query}"`);
    papers = await fetchArxiv(query, limit);
  }

  if (!papers) {
    return res.status(502).json({ error: 'Unable to retrieve papers from either source. Please try again shortly.' });
  }

  setCache(cacheKey, papers);
  return res.json({ data: papers, source: papers[0]?.source || 'unknown' });
});

module.exports = router;
