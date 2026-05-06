const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DIGEST_PATH = path.resolve(__dirname, '../../../openclaw/digest.json');

// GET /digest — return the latest compiled digest
router.get('/', (req, res) => {
  if (!fs.existsSync(DIGEST_PATH)) {
    return res.status(404).json({ error: 'No digest found. OpenClaw has not generated one yet.' });
  }

  try {
    const raw = fs.readFileSync(DIGEST_PATH, 'utf8');
    const digest = JSON.parse(raw);
    return res.json(digest);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to read digest file.' });
  }
});

// POST /digest/generate — trigger a fresh digest on demand
router.post('/generate', async (req, res) => {
  try {
    const generateDigest = require('../../../openclaw/skills/digest');
    const digest = await generateDigest();
    if (!digest) {
      return res.status(500).json({ error: 'Digest generation failed.' });
    }
    return res.json({ ok: true, generated_at: digest.generated_at });
  } catch (err) {
    console.error('[Digest] On-demand generation failed:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
