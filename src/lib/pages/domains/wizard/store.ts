import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';
import type { ProxyTypes } from '../index.svelte';
import type { Dependencies } from '$lib/constants';

export const domain = writable<Partial<Models.ProxyRule>>({ $id: '', domain: '' });
export const typeStore = writable<ProxyTypes>();
export const dependencyStore = writable<Dependencies>();
