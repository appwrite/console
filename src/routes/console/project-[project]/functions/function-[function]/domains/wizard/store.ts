import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

export const rule = writable<Partial<Models.ProxyRule>>({ $id: '', domain: '' });
