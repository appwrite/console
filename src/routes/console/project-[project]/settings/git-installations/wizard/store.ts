import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';

export const domain = writable<Partial<Models.Domain>>({ $id: '', domain: '' });
