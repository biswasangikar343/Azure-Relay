const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

const TARGET_URL = 'https://hetznew1.connect343.net:51616';

const proxy = httpProxy.createProxyServer({
  target: TARGET_URL,
  changeOrigin: true,
  secure: false,
  xfwd: true,
  ws: true,
  proxyTimeout: 0,
  timeout: 0,
  agent: new https.Agent({
    keepAlive: true,
    maxSockets: 300,
    rejectUnauthorized: false
  })
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', err.code, err.message);
  if (res?.writeHead) res.writeHead(502).end('Relay Error');
});

proxy.on('proxyReq', (proxyReq, req) => {
  console.log(`→ Proxying: ${req.method} ${req.url} | Host: ${req.headers.host}`);
});

const server = http.createServer((req, res) => {
  console.log(`Incoming: ${req.method} ${req.url} | Host: ${req.headers.host}`);

  if (req.url === '/' || req.url === '') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Azure TURBO Relay is Alive!');
    return;
  }
  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  console.log(`🔄 WebSocket Upgrade: ${req.url} | Host: ${req.headers.host}`);
  proxy.ws(req, socket, head);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Turbo Relay running on port ${PORT}`);
});
