import { writable } from 'svelte/store';

export const domain = writable<{ id: string; name: string }>({ id: '', name: '' });
