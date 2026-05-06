require('dotenv').config({ path: '../.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const fakeData = [
    {
      title: "AI Evaluation Tools",
      summary: "High research activity but low product adoption",
      score: 91
    },
    {
      title: "Synthetic Data Platforms",
      summary: "Growing research with emerging startups",
      score: 78
    }
  ];

  const { data, error } = await supabase
    .from('opportunities')
    .insert(fakeData);

  if (error) {
    console.error(error);
  } else {
    console.log("Inserted:", data);
  }
}

run();