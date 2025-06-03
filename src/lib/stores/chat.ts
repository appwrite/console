import { writable } from 'svelte/store';
import type { Conversation } from '$lib/sdk/imagine';
import { asyncWritable } from '$lib/helpers/stores';

export const showChat = writable(false);
export const showPrompt = writable(false);
export const conversation = asyncWritable<Conversation>();
