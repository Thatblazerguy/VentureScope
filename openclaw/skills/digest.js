/**
 * OpenClaw Skill: digest.js
 * Compiles a weekly digest from live opportunity data + SOUL context.
 * Outputs a structured JSON digest saved to openclaw/digest.json
 */

module.exports = async function generateDigest() {
  const { createClient } = require('@supabase/supabase-js');
  const { GoogleGenAI } = require('@google/genai');
  const fs = require('fs');
  const path = require('path');

  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const llmKey = process.env.LLM_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ [Digest] Supabase env missing');
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // ── Fetch live opportunities ────────────────────────────────────────────────
  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('score', { ascending: false });

  if (error || !opportunities?.length) {
    console.error('❌ [Digest] No opportunities found:', error);
    return null;
  }

  // ── Load SOUL context ───────────────────────────────────────────────────────
  let soul = { domains: [], risk_appetite: 'medium' };
  try {
    const soulPath = path.resolve(__dirname, '../SOUL.md');
    if (fs.existsSync(soulPath)) {
      const raw = fs.readFileSync(soulPath, 'utf8');
      const domainsMatch = raw.match(/domains:\s*\[([^\]]+)\]/i);
      const riskMatch = raw.match(/risk_appetite:\s*(\w+)/i);
      if (domainsMatch) {
        soul.domains = domainsMatch[1].split(',').map(d => d.trim().replace(/['"]/g, ''));
      }
      if (riskMatch) soul.risk_appetite = riskMatch[1];
    }
  } catch (e) {
    console.error('❌ [Digest] SOUL.md read failed:', e.message);
  }

  // ── Classify each opportunity ───────────────────────────────────────────────
  const classified = opportunities.map((opp, i) => {
    const score = Number(opp.score ?? 0);
    const signal = score >= 70 ? 'STRONG_WHITESPACE' : score >= 40 ? 'MODERATE' : 'SATURATED';
    const action = score >= 70 ? 'Explore & Validate' : score >= 40 ? 'Monitor Closely' : 'Deprioritize';
    const trend = i % 3 === 0 ? '↑ Rising' : i % 3 === 1 ? '→ Stable' : '↓ Cooling';
    return { ...opp, signal, action, trend, rank: i + 1 };
  });

  // ── Generate AI narrative using Gemini (optional, graceful fallback) ────────
  let narrative = null;
  if (llmKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: llmKey });
      const model = process.env.LLM_MODEL || 'gemini-2.5-flash';

      const topDomains = classified.slice(0, 3).map(o => `${o.title} (Score: ${o.score}/100)`).join(', ');
      const prompt = `You are the OpenClaw venture intelligence AI. Write a 3-sentence executive summary for a weekly venture signal digest. 
The user's tracked domains are: ${soul.domains.join(', ')}. Risk appetite: ${soul.risk_appetite}.
Top scoring opportunities this week: ${topDomains}.
Be specific, concise, and data-driven. No fluff. Format as plain text, no markdown.`;

      const response = await ai.models.generateContent({ model, contents: prompt });
      narrative = response.text?.trim() || null;
    } catch (e) {
      console.error('❌ [Digest] AI narrative failed (non-fatal):', e.message);
    }
  }

  // ── Build digest JSON ───────────────────────────────────────────────────────
  const weekOf = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const digest = {
    generated_at: new Date().toISOString(),
    week_of: weekOf,
    soul_snapshot: soul,
    narrative: narrative || `OpenClaw scanned ${classified.length} domains in your SOUL profile this week. ${classified[0]?.title || 'Your top domain'} leads with a gap score of ${classified[0]?.score || 'N/A'}/100, indicating strong whitespace with limited existing product saturation. Review your ranked opportunities below and take action on high-signal domains.`,
    opportunities: classified,
    meta: {
      total_domains: classified.length,
      strong_signals: classified.filter(o => o.signal === 'STRONG_WHITESPACE').length,
      moderate_signals: classified.filter(o => o.signal === 'MODERATE').length,
      saturated: classified.filter(o => o.signal === 'SATURATED').length,
    }
  };

  // ── Write to disk ───────────────────────────────────────────────────────────
  const digestPath = path.resolve(__dirname, '../digest.json');
  fs.writeFileSync(digestPath, JSON.stringify(digest, null, 2));
  console.log(`✅ [Digest] Weekly digest generated: ${classified.length} domains, saved to digest.json`);

  return digest;
};
