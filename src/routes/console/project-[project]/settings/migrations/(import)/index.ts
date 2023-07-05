import {
    PUBLIC_MOCK_APIKEY,
    PUBLIC_MOCK_ENDPOINT,
    PUBLIC_MOCK_PROJECTID
} from '$env/static/public';
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
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    endpoint?: string;
    apiKey?: string;
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

const initialFormData = {
    users: {
        root: false,
        teams: false
    },
    databases: {
        root: false,
        documents: false
    },
    functions: {
        root: false,
        env: false,
        inactive: false
    },
    storage: {
        root: false
    }
};
type FormData = typeof initialFormData;
export const formData = writable({ ...initialFormData });

type Resource =
    | 'User'
    | 'Team'
    | 'Membership'
    | 'File'
    | 'Bucket'
    | 'Function'
    | 'EnvVar'
    | 'Deployment'
    | 'Database'
    | 'Collection'
    | 'Index'
    | 'Attribute'
    | 'Document';

export const formDataToResources = (formData: FormData): Resource[] => {
    const resources: Resource[] = [];
    if (formData.users.root) {
        resources.push('User');
    }
    if (formData.users.teams) {
        resources.push('Team');
        resources.push('Membership');
    }
    if (formData.databases.root) {
        resources.push('Database');
    }
    if (formData.databases.documents) {
        resources.push('Collection');
        resources.push('Document');
    }
    if (formData.functions.root) {
        resources.push('Function');
    }
    if (formData.functions.env) {
        resources.push('EnvVar');
    }
    if (formData.functions.inactive) {
        resources.push('Deployment');
    }
    if (formData.storage.root) {
        resources.push('Bucket');
        resources.push('File');
    }

    return resources;
};

export const resetImportStores = () => {
    provider.set({ ...mockProvider });
    formData.set({ ...initialFormData });
};

export function openImportWizard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wizard.start(Wizard as any);
}
