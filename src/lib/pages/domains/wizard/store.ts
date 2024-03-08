import type { Models, ResourceType } from '@appwrite.io/console';
import { writable } from 'svelte/store';
import type { Dependencies } from '$lib/constants';

export const domain = writable<Partial<Models.ProxyRule>>({ $id: '', domain: '' });
export const typeStore = writable<ResourceType>();
export const dependencyStore = writable<Dependencies>();
