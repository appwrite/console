import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

export const user = writable<Models.User<Record<string, unknown>>>();
