import type { HeaderAlert } from '$lib/stores/headerAlert';
import type { Organization } from '$lib/stores/organization';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const version = writable<string | null>(null);
export const consoleVariables = writable<Models.ConsoleVariables | undefined>(undefined);
export const protocol = derived(consoleVariables, (vars) =>
    vars?._APP_OPTIONS_FORCE_HTTPS === 'enabled' ? 'https://' : 'http://'
);

export const activeHeaderAlert = writable<HeaderAlert>(null);
export const orgMissingPaymentMethod = writable<Organization>(null);
