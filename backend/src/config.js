const path = require('path');
require('dotenv').config();

// Support comma-separated list of allowed origins
const frontendOrigin = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  frontendOrigin,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseOpportunitiesTable: process.env.SUPABASE_OPPORTUNITIES_TABLE || 'opportunities',
  openClawCopilotUrl: process.env.OPENCLAW_COPILOT_URL || '',
  soulPath: path.resolve(__dirname, '../../intelligence/SOUL.md'),
};