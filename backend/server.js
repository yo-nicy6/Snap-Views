import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory cache
const cache = new Map();
let cacheSettings = {
  enabled: true,
  ttl: 300, // seconds
};

app.use(cors());
app.use(express.json());

// Helper: get cached or fetch
async function fetchSnap(username) {
  const key = username.toLowerCase();
  
  if (cacheSettings.enabled && cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    const age = (Date.now() - timestamp) / 1000;
    if (age < cacheSettings.ttl) {
      return { data, cached: true, age: Math.floor(age) };
    }
  }

  const res = await fetch(`https://snapchatapi.asapiservices.workers.dev/snap?username=${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  if (cacheSettings.enabled) {
    cache.set(key, { data, timestamp: Date.now() });
  }

  return { data, cached: false, age: 0 };
}

// GET /api/snap?username=xxx
app.get('/api/snap', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'username is required' });

  try {
    const result = await fetchSnap(username);
    res.json({
      success: true,
      cached: result.cached,
      age: result.age,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/settings
app.get('/api/settings', (req, res) => {
  res.json({
    cache: cacheSettings,
    cacheSize: cache.size,
    cachedUsernames: Array.from(cache.keys()),
  });
});

// PUT /api/settings
app.put('/api/settings', (req, res) => {
  const { enabled, ttl } = req.body;
  if (typeof enabled === 'boolean') cacheSettings.enabled = enabled;
  if (typeof ttl === 'number' && ttl > 0) cacheSettings.ttl = ttl;
  res.json({ success: true, cache: cacheSettings });
});

// DELETE /api/cache
app.delete('/api/cache', (req, res) => {
  const size = cache.size;
  cache.clear();
  res.json({ success: true, cleared: size });
});

// DELETE /api/cache/:username
app.delete('/api/cache/:username', (req, res) => {
  const key = req.params.username.toLowerCase();
  const existed = cache.has(key);
  cache.delete(key);
  res.json({ success: true, deleted: existed });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), cacheSize: cache.size });
});

app.listen(PORT, () => {
  console.log(`🚀 SnapViewer API running on http://localhost:${PORT}`);
});
