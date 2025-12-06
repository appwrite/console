import { createMigrationFormStore, createMigrationProviderStore } from '$lib/stores/migration';
import { wizard } from '$lib/stores/wizard';
import { requestedMigration } from '$routes/store';
import { get, writable } from 'svelte/store';
import { Region } from '@appwrite.io/console';

export const formData = createMigrationFormStore();

export async function openMigrationWizard() {
    const { default: Wizard } = await import('./wizard.svelte');
    wizard.start(Wizard);

    const migrationData = get(requestedMigration);
    provider.set({
        provider: 'appwrite',
        apiKey: migrationData?.apiKey,
        endpoint: migrationData?.endpoint,
        projectID: migrationData?.projectId
    });
}

export const selectedProject = writable<string>(null);
export const selectedRegion = writable<Region>(Region.Fra);

export const provider = createMigrationProviderStore();
