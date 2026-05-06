const express = require('express');
const { getSupabaseClient } = require('../lib/supabase');
const { supabaseOpportunitiesTable } = require('../config');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase client is not configured',
      });
    }

    const { data, error } = await supabase
      .from(supabaseOpportunitiesTable)
      .select('*')
      .order('title', { ascending: true })

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({
        error: error.message,
      });
    }

    const { loadSoulMemory } = require('../lib/soul');
    const { soulPath } = require('../config');
    const soul = loadSoulMemory(soulPath);
    const userDomains = soul?.profile?.user_profile?.domains || [];
    const targetDomains = userDomains.map(d => d.toLowerCase());

    let opportunities = data || [];
    
    // If the user has defined domains, strictly filter out anything else from the UI
    if (targetDomains.length > 0) {
      opportunities = opportunities.filter(op => targetDomains.includes(op.title.toLowerCase()));
    } else {
      // If no domains defined yet, return nothing to match the empty state
      opportunities = [];
    }

    return res.json({
      opportunities: opportunities,
    });

  } catch (err) {
    console.error("FULL ERROR:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;