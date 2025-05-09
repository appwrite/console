/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const ASSETS = [
    ...build, // the app itself
    ...files // everything in `static`
];

// Preload all assets
sw.addEventListener('install', (event) => {
    event.waitUntil(Promise.allSettled(ASSETS.map((asset) => fetch(asset))));
});

// Clean up all old caches left by previous service workers
sw.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    );
});
