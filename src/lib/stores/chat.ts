import { writable } from 'svelte/store';
import type { Conversation } from '$lib/sdk/imagine';
import { asyncWritable } from '$lib/helpers/stores';
import type { WorkspaceStateUIDataPart } from '../../../ai-service/src/lib/ai/custom-parts/workspace-state';
import type { SvelteURL } from 'svelte/reactivity';

export const showChat = writable(false);
export const showPrompt = writable(false);
export const conversation = asyncWritable<Conversation>();


export type WorkspaceState = Omit<WorkspaceStateUIDataPart["data"], "workspaceUrl"> & {
    workspaceUrl: SvelteURL | null;
}

export const workspaceState = writable<WorkspaceState>({
    state: "pending",
    steps: [],
    workspaceUrl: null,
});
