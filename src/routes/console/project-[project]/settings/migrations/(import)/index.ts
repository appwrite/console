import {
    PUBLIC_MOCK_APIKEY,
    PUBLIC_MOCK_ENDPOINT,
    PUBLIC_MOCK_PROJECTID,
    PUBLIC_SUPABASE_TEST_ENDPOINT,
    PUBLIC_SUPABASE_TEST_HOST,
    PUBLIC_SUPABASE_TEST_KEY,
    PUBLIC_SUPABASE_TEST_PASSWORD,
    PUBLIC_SUPABASE_TEST_USERNAME,
    PUBLIC_SUPABASE_TEST_PORT,
    PUBLIC_NHOST_TEST_SUBDOMAIN,
    PUBLIC_NHOST_TEST_REGION,
    PUBLIC_NHOST_TEST_SECRET,
    PUBLIC_NHOST_TEST_DATABASE,
    PUBLIC_NHOST_TEST_USERNAME,
    PUBLIC_NHOST_TEST_PASSWORD
} from '$env/static/public';
import { createMigrationFormStore } from '$lib/stores/migration';
import { wizard } from '$lib/stores/wizard';
import { writable } from 'svelte/store';
import Wizard from './wizard.svelte';

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
    username?: string;
    password?: string;
    endpoint?: string;
    apiKey?: string;
    port?: number;
};

type NhostInput = {
    provider: 'nhost';
    region?: string;
    subdomain?: string;
    database?: string;
    username?: string;
    password?: string;
    adminSecret?: string;
};

type ProviderInput = AppwriteInput | NhostInput | SupabaseInput | FirebaseInput;

const initialProvider: ProviderInput = { provider: 'appwrite' };
// const mockProvider: ProviderInput = {
//     provider: 'appwrite',
//     endpoint: PUBLIC_MOCK_ENDPOINT,
//     apiKey: PUBLIC_MOCK_APIKEY,
//     projectID: PUBLIC_MOCK_PROJECTID
// };
// const mockProvider: ProviderInput = {
//     provider: 'supabase',
//     endpoint: PUBLIC_SUPABASE_TEST_ENDPOINT,
//     apiKey: PUBLIC_SUPABASE_TEST_KEY,
//     host: PUBLIC_SUPABASE_TEST_HOST,
//     port: Number(PUBLIC_SUPABASE_TEST_PORT),
//     username: PUBLIC_SUPABASE_TEST_USERNAME,
//     password: PUBLIC_SUPABASE_TEST_PASSWORD
// };
const mockProvider: ProviderInput = {
    provider: 'nhost',
    subdomain: PUBLIC_NHOST_TEST_SUBDOMAIN,
    region: PUBLIC_NHOST_TEST_REGION,
    adminSecret: PUBLIC_NHOST_TEST_SECRET,
    database: PUBLIC_NHOST_TEST_DATABASE,
    username: PUBLIC_NHOST_TEST_USERNAME,
    password: PUBLIC_NHOST_TEST_PASSWORD
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
