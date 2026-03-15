const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

const POLY_BASE = 'https://gamma-api.polymarket.com/markets';

function fetchPolymarket(queryString) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${POLY_BASE}?${queryString}`;
    const options = {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; PolymarketProxy/1.0)'
      }
    };
    https.get(fullUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data }); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);

  // Health check
  if (parsed.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return;
  }

  // Main proxy endpoint: /api/markets
  if (parsed.pathname === '/api/markets') {
    const limit   = parseInt(parsed.query.limit)  || 35;
    const order   = parsed.query.order            || 'volume';
    const qs = `active=true&closed=false&limit=${Math.min(limit,100)}&order=${order}&ascending=false`;

    try {
      const result = await fetchPolymarket(qs);
      res.setHeader('Cache-Control', 'public, max-age=30');
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(result.body);
    } catch(err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Upstream error: ' + err.message }));
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', endpoints: ['/api/markets', '/health'] }));
});

server.listen(PORT, () => {
  console.log(`Polymarket proxy running on port ${PORT}`);
});
