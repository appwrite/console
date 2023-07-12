import {
    PUBLIC_MOCK_APIKEY,
    PUBLIC_MOCK_ENDPOINT,
    PUBLIC_MOCK_PROJECTID
} from '$env/static/public';
import { createMigrationFormStore } from '$lib/stores/migration';
import { wizard } from '$lib/stores/wizard';
import { writable } from 'svelte/store';
import Wizard from './wizard.svelte';

export type Provider = 'appwrite' | 'nhost' | 'supabase' | 'firebase';

type AppwriteInput = {
    provider: 'appwrite';
    endpoint?: string;
    projectID?: string;
    apiKey?: string;
};

type FirebaseInput = {
    provider: 'firebase';
    serviceAccount?: string;
};

type SupabaseInput = {
    provider: 'supabase';
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    endpoint?: string;
    apiKey?: string;
};

type NhostInput = {
    provider: 'nhost';
    region?: string;
    subdomain?: string;
    database?: string;
    username?: string;
    password?: string;
    adminSecret?: string;
    port?: number;
};

type ProviderInput = AppwriteInput | NhostInput | SupabaseInput | FirebaseInput;

const initialProvider: ProviderInput = { provider: 'appwrite' };
const mockProvider: ProviderInput = {
    provider: 'appwrite',
    endpoint: PUBLIC_MOCK_ENDPOINT,
    apiKey: PUBLIC_MOCK_APIKEY,
    projectID: PUBLIC_MOCK_PROJECTID
};
export const provider = writable<ProviderInput>({ ...mockProvider });

export const formData = createMigrationFormStore();

export const resetImportStores = () => {
    provider.set({ ...mockProvider });
    formData.reset();
};

export function openImportWizard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wizard.start(Wizard as any);
}
