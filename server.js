// =============================================
// server.js — CertifyChain Proxy Server
// Run: node server.js
// Open: http://localhost:3000
// =============================================

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT    = 3000;
const API_KEY = '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';

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.pdf':  'application/pdf',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {

  // ---- CORS headers ----
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // =============================================
  // POST /api/ai — proxy to Anthropic
  // =============================================
  if (req.method === 'POST' && req.url === '/api/ai') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {

      let payload;
      try {
        payload = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'Invalid JSON body' } }));
        return;
      }

      const postData = JSON.stringify({
        model:      payload.model      || 'claude-sonnet-4-20250514',
        max_tokens: payload.max_tokens || 1200,
        system:     payload.system     || '',
        messages:   payload.messages   || [],
      });

      const options = {
        hostname: 'api.anthropic.com',
        port:     443,
        path:     '/v1/messages',
        method:   'POST',
        headers: {
          'Content-Type':      'application/json',
          'Content-Length':    Buffer.byteLength(postData),
          'x-api-key':         API_KEY,
          'anthropic-version': '2023-06-01',
        }
      };

      console.log('[AI] Request received →', payload.messages?.[0]?.content?.toString?.().substring(0, 60) + '...');

      const apiReq = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => { data += chunk; });
        apiRes.on('end', () => {
          console.log('[AI] Response status:', apiRes.statusCode);
          res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(data);
        });
      });

      apiReq.on('error', (err) => {
        console.error('[AI] Request error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'Proxy error: ' + err.message } }));
      });

      apiReq.write(postData);
      apiReq.end();
    });
    return;
  }

  // =============================================
  // GET — serve static files
  // =============================================
  let urlPath = req.url.split('?')[0].split('#')[0];
  if (urlPath === '/') urlPath = '/index.html';

  // Security: prevent directory traversal
  const fullPath = path.normalize(path.join(__dirname, urlPath));
  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(fullPath).toLowerCase();

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      // Try adding .html extension
      fs.readFile(fullPath + '.html', (err2, data2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found: ' + urlPath);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data2);
        }
      });
    } else {
      res.writeHead(200, { 'Content-Type': MIME_MAP[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
});

// Handle port already in use
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ERROR: Port ${PORT} is already in use!`);
    console.error(`  Fix: Close the other server, or run: npx kill-port ${PORT}\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║    CertifyChain Server — RUNNING!        ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Open:  http://localhost:${PORT}              ║`);
  console.log(`║  Also:  http://127.0.0.1:${PORT}              ║`);
  console.log('║  AI:    Connected via Anthropic API ✓    ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('\n  Ctrl+C to stop\n');
});
