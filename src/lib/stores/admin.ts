import { writable, type Writable } from 'svelte/store';

export const modeOverwrite: Writable<'cloud' | 'self-hosted'> = writable('cloud');
export const modeTier: Writable<'base' | 'premium' | 'enterprise'> = writable('base');
