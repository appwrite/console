import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';

export const showCreate = writable(false);

export const targetsById = writable<Record<string, Models.Target>>({});
export const topicsById = writable<Record<string, Models.Topic>>({});
