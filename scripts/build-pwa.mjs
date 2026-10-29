import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
async function files(dir, prefix = "") {
  const output = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === "sw.js") continue;
    const name = `${prefix}/${entry.name}`;
    if (entry.isDirectory())
      output.push(...(await files(`${dir}/${entry.name}`, name)));
    else output.push(name);
  }
  return output;
}
const assets = (await files("dist")).sort();
const hash = createHash("sha256");
for (const asset of assets) hash.update(await readFile(`dist${asset}`));
const version = `mytax-static-${hash.digest("hex").slice(0, 16)}`;
const source = `
const CACHE = ${JSON.stringify(version)};
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', event => {
  // Keep the previous static bundle for an older open tab during an explicit update.
  event.waitUntil(caches.keys().then(keys => {
    const old = keys.filter(k => k.startsWith('mytax-static-') && k !== CACHE);
    return Promise.all(old.slice(0, -1).map(k => caches.delete(k)));
  }).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.open(CACHE).then(cache => cache.match('/index.html'))));
    return;
  }
  if (ASSETS.includes(url.pathname) || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/fonts/')) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname).then(async saved => saved || await caches.match(url.pathname) || fetch(request))));
  }
});
`;
await writeFile("dist/sw.js", source);
console.log(
  `PWA: ${assets.length} static assets precached; financial data stays outside the cache.`,
);
