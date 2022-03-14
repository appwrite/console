import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

export const document = writable<Models.Document>();
