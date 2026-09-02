const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(body));
}

function tokenFrom(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

function auth(req) {
  const token = tokenFrom(req);
  if (!token) throw new Error("UNAUTHORIZED");
  return jwt.verify(token, process.env.JWT_SECRET);
}

async function rumah(path, init = {}) {
  const r = await fetch(`https://www.rumahotp.io/api/${path}`, {
    ...init,
    headers: {
      "x-apikey": process.env.RUMAHOTP_API_KEY,
      "Accept": "application/json",
      ...(init.headers || {})
    }
  });
  const data = await r.json();
  if (!r.ok || data.success === false) {
    throw new Error(data?.error?.message || "RumahOTP API error");
  }
  return data;
}

module.exports = { supabase, json, auth, rumah };
