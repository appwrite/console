import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';

export const user = writable<Models.User<Record<string, unknown>>>();
