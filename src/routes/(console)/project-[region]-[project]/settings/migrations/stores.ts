import { writable } from 'svelte/store';

export const started = writable(performance.now());
