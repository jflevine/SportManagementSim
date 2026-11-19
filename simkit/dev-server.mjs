// Local test environment: `node simkit/dev-server.mjs` then open
//   http://localhost:8787/spm370/the-report/?dev        (student)
//   http://localhost:8787/spm370/the-report/instructor.html?dev   (instructor key: dev)
// Serves the repository and runs the real handler against an in-memory store.
// Set OPENAI_API_KEY in your shell to hear AI voices; otherwise prepared voices are used.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHandler, httpAdapter, sha256 } from './handler.mjs';
import { createMemoryStore } from './stores.mjs';
import { authoredVoice, openaiVoice } from './voice.mjs';
import { cases } from './cases.mjs';

const root = normalize(join(fileURLToPath(import.meta.url), '..', '..'));
const voice = process.env.OPENAI_API_KEY ? openaiVoice({ key: process.env.OPENAI_API_KEY }) : authoredVoice();
const handle = createHandler({ store: createMemoryStore(), cases, voice, instructorKeyHash: await sha256('dev') });
const api = httpAdapter(handle);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/simkit-api') {
    const chunks = []; for await (const c of req) chunks.push(c);
    const r = await api(new Request('http://localhost/simkit-api', { method: req.method, headers: req.headers, body: ['GET', 'OPTIONS'].includes(req.method) ? undefined : Buffer.concat(chunks) }));
    res.writeHead(r.status, Object.fromEntries(r.headers)); return res.end(await r.text());
  }
  let path = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!path.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (url.pathname.endsWith('/')) path = join(path, 'index.html');
  try { const body = await readFile(path); res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(body); }
  catch { res.writeHead(404); res.end('Not found'); }
}).listen(process.env.PORT || 8787, () => console.log(`simkit dev server on http://localhost:${process.env.PORT || 8787}  (voice: ${voice.name})`));
