module.exports = async function runPipeline(context) {
  const { createClient } = require('@supabase/supabase-js');
  const path = require('path');

  // Load env properly
  require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
  });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("ENV CHECK:", {
    url: supabaseUrl,
    key: supabaseKey ? "exists" : "missing"
  });

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase env missing");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // -------------------------------
  // GAP SCORE LOGIC
  // 3-part composite:
  // 1. Research momentum: how actively is science exploring this? (cap at 50,001)
  // 2. Market saturation: how many products already exist? (cap at 2,000,001)
  // 3. Whitespace weight: saturated markets penalized, but not zeroed (0.85 coeff)
  // -------------------------------
  function computeGapScore(research, products) {
    // Guard: No academic signal = no investable opportunity
    if (research === 0) return 1;

    // Research capped at 50k for max momentum
    const researchNorm = Math.log10(research + 1) / Math.log10(50001);
    
    // Products capped at 2M for max saturation
    const productNorm = Math.log10(products + 1) / Math.log10(2000001);

    // 0.85 coefficient prevents breakthrough research domains from scoring 0 just because some products exist
    const whitespace = 1 - (productNorm * 0.85);

    const raw = researchNorm * whitespace * 100;
    return Math.min(100, Math.max(1, Math.round(raw)));
  }

  // -------------------------------
  // FETCH REAL DATA (ArXiv)
  // -------------------------------
  async function fetchArxivData(query) {
    try {
      const fetch = (await import('node-fetch')).default;

      const url = `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=10`;

      const res = await fetch(url);
      const text = await res.text();

      // Tag may have XML namespace attrs: <opensearch:totalResults xmlns:opensearch="...">
      const totalMatch = text.match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/);
      const count = totalMatch ? parseInt(totalMatch[1], 10) : 0;

      return count;
    } catch (err) {
      console.error("❌ ArXiv fetch failed:", err);
      return 0;
    }
  }

  // -------------------------------
  // FETCH PRODUCT SIGNAL (GitHub)
  // -------------------------------
  async function fetchGithubRepos(query) {
    try {
      const fetch = (await import('node-fetch')).default;

      const url = `https://api.github.com/search/repositories?q=${query}&per_page=5`;

      const res = await fetch(url, {
        headers: {
          "Accept": "application/vnd.github+json"
        }
      });

      const data = await res.json();

      return data.total_count || 0;

    } catch (err) {
      console.error("❌ GitHub fetch failed:", err);
      return 1;
    }
  }

  console.log("🚀 Running OpenClaw pipeline...");

  // -------------------------------
  // DOMAINS
  // -------------------------------
  let domains = [
    "ai agents",
    "robotics ai",
    "synthetic data"
  ];

  try {
    const fs = require('fs');
    const soulPath = path.resolve(__dirname, '../../intelligence/SOUL.md');
    if (fs.existsSync(soulPath)) {
      const { loadSoulMemory } = require('../../backend/src/lib/soul');
      const soul = loadSoulMemory(soulPath);
      const userDomains = soul?.profile?.user_profile?.domains;
      if (Array.isArray(userDomains) && userDomains.length > 0) {
        domains = userDomains;
      }
    }
  } catch (err) {
    console.error("❌ Failed to load SOUL.md:", err);
  }

  console.log("🎯 Targeting domains:", domains);

  const opportunities = await Promise.all(domains.map(async (domain) => {
    const title = domain.toLowerCase();
    const encodedDomain = encodeURIComponent(domain);

    const [researchCount, productCount] = await Promise.all([
      fetchArxivData(encodedDomain),
      fetchGithubRepos(encodedDomain)
    ]);

    const score = computeGapScore(researchCount, productCount);

    console.log(`📊 [${title}] research=${researchCount} | products=${productCount} | score=${score}`);

    return {
      title: title,
      summary: `Research signals: ${researchCount} papers | Product signals: ${productCount} repos`,
      score: score,
      updated_at: new Date().toISOString()
    };
  }));

  // -------------------------------
  // UPSERT (NO DUPLICATES)
  // -------------------------------
  const { data, error } = await supabase
    .from('opportunities')
    .upsert(opportunities, { onConflict: 'title' })
    .select();

  if (error) {
    console.error("❌ Insert error:", error);
  } else {
    console.log("✅ Upserted opportunities:", data);
  }

  // -------------------------------
  // CLEANUP STALE DOMAINS
  // -------------------------------
  const titlesToKeep = domains.map(d => d.toLowerCase());
  const { data: existingData } = await supabase.from('opportunities').select('title');
  
  if (existingData) {
    const titlesToDelete = existingData
      .map(row => row.title)
      .filter(title => !titlesToKeep.includes(title));

    if (titlesToDelete.length > 0) {
      console.log("🧹 Cleaning up old domains from DB:", titlesToDelete);
      await supabase
        .from('opportunities')
        .delete()
        .in('title', titlesToDelete);
    }
  }
};