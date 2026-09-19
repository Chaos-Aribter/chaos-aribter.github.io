import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(project, process.env.NEWS_PREVIEW_DIR || 'out');
const port = Number(process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.txt':'text/plain; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff2':'font/woff2', '.glb':'model/gltf-binary' };
try { await fs.access(path.join(root, 'index.html')); }
catch { console.error('未找到构建结果，请先执行新闻生成脚本。'); process.exit(1); }
const server = http.createServer(async (req, res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
    for (const candidate of [file, file + '.html', path.join(file, 'index.html')]) {
      try {
        if (!(await fs.stat(candidate)).isFile()) continue;
        const body = await fs.readFile(candidate);
        res.writeHead(200, {'Content-Type':types[path.extname(candidate)] || 'application/octet-stream', 'Cache-Control':'no-store'});
        res.end(req.method === 'HEAD' ? undefined : body);return;
      } catch { /* Try the next static path. */ }
    }
    res.writeHead(404);res.end('Not found');
  } catch {res.writeHead(400);res.end('Bad request');}
});
server.on('error', error => {console.error(`本地预览启动失败：${error.message}`);process.exitCode=1;});
server.listen(port, '127.0.0.1', () => console.log(`本地预览：http://127.0.0.1:${port}\n按 Ctrl+C 停止；只预览已生成文件，不会上传。`));
