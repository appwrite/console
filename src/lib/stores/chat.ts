import { writable } from 'svelte/store';
import type { Conversation } from '$lib/sdk/imagine';

export const showChat = writable(false);
export const showPrompt = writable(false);
export const conversation = writable<Conversation>();
