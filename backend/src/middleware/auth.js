const { getSupabaseClient } = require('../lib/supabase');

async function requireSupabaseSession(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  req.user = null;
  req.sessionToken = null;

  if (!token) {
    return next();
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return next();
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return next();
  }

  req.user = data.user;
  req.sessionToken = token;
  return next();
}

module.exports = {
  requireSupabaseSession,
};