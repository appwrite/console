import { createMigrationFormStore, createMigrationProviderStore } from '$lib/stores/migration';
import { wizard } from '$lib/stores/wizard';
import { requestedMigration } from '$routes/store';
import { get, writable } from 'svelte/store';
import Wizard from './wizard.svelte';

export const formData = createMigrationFormStore();

export function openMigrationWizard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wizard.start(Wizard as any);
    const migData = get(requestedMigration);
    provider.set({
        provider: 'appwrite',
        apiKey: migData?.apiKey,
        endpoint: migData?.endpoint,
        projectID: migData?.projectId
    });
}

export const selectedProject = writable(null);

export const provider = createMigrationProviderStore();
