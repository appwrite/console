import { writable } from 'svelte/store';
import type { ErrorParams } from '$lib/studio/studio-widget';

export const lastError = writable<ErrorParams>(null);
