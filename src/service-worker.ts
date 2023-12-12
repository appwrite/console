import { dev } from '$app/environment';
import { version, build, files } from '$service-worker';
if (!dev) {
    const name = `cache-${version}`;
    const cachedFiles = [...build, ...files];

    self.addEventListener('install', (event: ExtendableEvent) => {
        event.waitUntil(caches.open(name).then((cache) => cache.addAll(cachedFiles)));
    });

    self.addEventListener('activate', (event: ExtendableEvent) => {
        event.waitUntil(
            caches.keys().then(async (keys) => {
                for (const key of keys) {
                    if (!key.includes(version)) caches.delete(key);
                }
            })
        );
    });

    self.addEventListener('fetch', (event: FetchEvent) => {
        const { request } = event;

        if (request.method !== 'GET' || request.headers.has('range')) return;

        const url = new URL(request.url);
        const cached = caches.match(request);

        if (url.origin === location.origin && cachedFiles.includes(url.pathname)) {
            // always return build files from cache
            event.respondWith(cached);
        } else if (url.protocol === 'https:' || location.hostname === 'localhost') {
            // hit the network for everything else...
            const promise = fetch(request);

            // ...and cache successful responses...
            promise.then((response) => {
                // cache successful responses
                if (response.ok && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(name).then((cache) => {
                        cache.put(request, clone);
                    });
                }
            });

            // ...but if it fails, fall back to cache if available
            event.respondWith(promise.catch(() => cached || promise));
        }
    });
}
