// servidor estático para pré-visualização local (sem dependências)
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  const arquivo = path.join(RAIZ, path.normalize(url).replace(/^([/\\])+/, ''));
  if (!arquivo.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
  fs.readFile(arquivo, (erro, dados) => {
    if (erro) { res.writeHead(404); return res.end('404'); }
    const ext = path.extname(arquivo).toLowerCase();
    res.writeHead(200, {
      'Content-Type': TIPOS[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(dados);
  });
}).listen(process.env.PORT || 8080, '0.0.0.0', () => {
  console.log('meu-bolso em http://0.0.0.0:' + (process.env.PORT || 8080));
});
