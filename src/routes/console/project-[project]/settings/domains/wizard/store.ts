import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

export const domain = writable<Partial<Models.Domain>>({ $id: '', domain: '' });
