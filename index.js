const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

const TARGET_URL = 'https://hetznew1.connect343.net:51616';

const proxy = httpProxy.createProxyServer({
  target: TARGET_URL,
  changeOrigin: true,
  secure: false,
  xfwd: true,
  proxyTimeout: 0,
  timeout: 0,
  followRedirects: false,
  
  // ← این بخش خیلی مهمه (برای https تارگت)
  agent: new https.Agent({
    keepAlive: true,
    maxSockets: 100,
    rejectUnauthorized: false   // چون secure: false هست
  })
});

proxy.on('error', function (err, req, res) {
  console.error('Proxy Error:', err.message);
  if (res && res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Relay Error - Target unreachable');
  }
});

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Azure TURBO Relay is Alive!');
    return;
  }
  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Turbo Relay running on port ${PORT}`);
});
