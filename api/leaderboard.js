// Vercel Edge function — shared leaderboard backed by Upstash Redis.
// GET  /api/leaderboard?route=excited   → top 10 times for that route
// POST /api/leaderboard  { route, name, time, crashes }  → submit + top 10
//
// Set up storage:
//   Vercel dashboard → Storage → Upstash Serverless DB (Redis, free tier)
//   → Connect to the toronto-nyc-bike project. Env vars auto-populate.
//
// Until storage is configured, this returns 503 and the frontend falls
// back to per-device localStorage.

export const config = { runtime: 'edge' };

const URL_ENV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_ENV = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const MAX_KEEP = 100; // trim sorted set to top 100 entries to bound size

async function redis(...cmd) {
  const resp = await fetch(URL_ENV, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN_ENV}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cmd)
  });
  if (!resp.ok) {
    throw new Error(`upstash ${resp.status}`);
  }
  const data = await resp.json();
  return data.result;
}

const isValidRoute = (r) => r === 'excited' || r === 'aggressive';

function cleanName(n) {
  if (typeof n !== 'string') return null;
  const trimmed = n.trim().slice(0, 12);
  if (!trimmed) return null;
  if (!/^[A-Za-z0-9 ._-]+$/.test(trimmed)) return null;
  return trimmed;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function parseEntries(raw) {
  const out = [];
  for (let i = 0; i < raw.length; i += 2) {
    try {
      const meta = JSON.parse(raw[i]);
      out.push({
        name: meta.name,
        crashes: meta.crashes || 0,
        ts: meta.ts || 0,
        time: parseFloat(raw[i + 1])
      });
    } catch (_) { /* skip malformed */ }
  }
  return out;
}

export default async function handler(req) {
  if (!URL_ENV || !TOKEN_ENV) {
    return jsonResponse({ error: 'storage not configured' }, 503);
  }

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const route = url.searchParams.get('route');
      if (!isValidRoute(route)) return jsonResponse({ error: 'invalid route' }, 400);
      const raw = await redis('ZRANGE', `lb:${route}`, '0', '9', 'WITHSCORES');
      return jsonResponse({ entries: parseEntries(raw || []) });
    }

    if (req.method === 'POST') {
      let body;
      try { body = await req.json(); }
      catch { return jsonResponse({ error: 'bad json' }, 400); }

      if (!isValidRoute(body.route)) return jsonResponse({ error: 'invalid route' }, 400);
      const name = cleanName(body.name);
      if (!name) return jsonResponse({ error: 'invalid name (1-12 chars, A-Z 0-9 . _ -)' }, 400);

      const time = parseFloat(body.time);
      if (!isFinite(time) || time < 5 || time > 600) {
        return jsonResponse({ error: 'invalid time' }, 400);
      }
      const crashes = Math.max(0, Math.min(100, parseInt(body.crashes, 10) || 0));

      const key = `lb:${body.route}`;
      const member = JSON.stringify({ name, crashes, ts: Date.now() });

      await redis('ZADD', key, time.toString(), member);
      await redis('ZREMRANGEBYRANK', key, MAX_KEEP.toString(), '-1');

      const raw = await redis('ZRANGE', key, '0', '9', 'WITHSCORES');
      return jsonResponse({ entries: parseEntries(raw || []) });
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    return jsonResponse({ error: 'method not allowed' }, 405);
  } catch (err) {
    return jsonResponse({ error: 'storage error', detail: String(err.message || err) }, 500);
  }
}
