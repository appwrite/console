import { writable } from 'svelte/store';
import type { Conversation } from '$lib/sdk/imagine';
import { asyncWritable } from '$lib/helpers/stores';
import type { SvelteURL } from 'svelte/reactivity';

type WorkspaceState = {
    ready: boolean;
    workspaceUrl: SvelteURL | null;
}

export const showChat = writable(false);
export const showPrompt = writable(false);
export const conversation = asyncWritable<Conversation>();
export const workspaceState = writable<WorkspaceState>({
    ready: false,
    workspaceUrl: null,
});
