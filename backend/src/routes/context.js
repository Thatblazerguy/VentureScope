const express = require('express');
const { requireSupabaseSession } = require('../middleware/auth');
const { loadSoulMemory, updateSoulMemory } = require('../lib/soul');
const { soulPath } = require('../config');

const router = express.Router();

router.get('/', requireSupabaseSession, (req, res) => {
  const soul = loadSoulMemory(soulPath);

  return res.json({
    user: req.user,
    soul,
  });
});

router.patch('/', requireSupabaseSession, async (req, res) => {
  const { user_profile: userProfile = {} } = req.body || {};
  const soul = updateSoulMemory(soulPath, {
    user_profile: userProfile,
  });

  try {
    const runPipeline = require('../../../openclaw/skills/pipeline');
    await runPipeline(soul);
  } catch (err) {
    console.error("Pipeline trigger failed:", err);
  }

  return res.json({
    user: req.user,
    soul,
  });
});

module.exports = router;