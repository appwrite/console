import { createMigrationFormStore } from '$lib/stores/migration';
import { wizard } from '$lib/stores/wizard';
import { writable } from 'svelte/store';
import Wizard from './wizard.svelte';

export const formData = createMigrationFormStore();

export function openMigrationWizard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wizard.start(Wizard as any);
}

export const selectedProject = writable(null);
