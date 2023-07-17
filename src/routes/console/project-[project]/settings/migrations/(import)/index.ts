import { createMigrationFormStore, createMigrationProviderStore } from '$lib/stores/migration';
import { wizard } from '$lib/stores/wizard';
import Wizard from './wizard.svelte';

export const provider = createMigrationProviderStore();

export const formData = createMigrationFormStore();

export const resetImportStores = () => {
    provider.changeProvider('appwrite');
    formData.reset();
};

export function openImportWizard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wizard.start(Wizard as any);
}
