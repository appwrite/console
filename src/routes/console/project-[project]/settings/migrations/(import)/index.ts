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

type NhostInput = {
    provider: 'nhost';
};
type SupabaseInput = {
    provider: 'supabase';
};
type FirebaseInput = {
    provider: 'firebase';
};

type ProviderInput = AppwriteInput | NhostInput | SupabaseInput | FirebaseInput;

const initialProvider: ProviderInput = { provider: 'appwrite' };
const mockProvider: ProviderInput = {
    provider: 'appwrite',
    endpoint: 'https://torsten.appwrite.org/v1',
    apiKey: '34c94260f05d44325aefe025acb33fc1f814647e9fa87050b8751f1182f7cf4a8e2aed09e9b29477fafedb3d0c71e46478e8b9f0bcab3604ff927972deeaaf99272ab63cc30a087fc1e09a86a4d8e3363caf88b9e003e0e7321e6021f90fa147468e5caa1bb43e8fef5ca0d8b2e048272f37f7b1c001a19524b21bc41d9ac2bd',
    projectID: '642c3cddd42da42e1bc6'
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
    | 'user'
    | 'team'
    | 'teammembership'
    | 'file'
    | 'bucket'
    | 'function'
    | 'envvar'
    | 'deployment'
    | 'database'
    | 'collection'
    | 'index'
    | 'attribute'
    | 'document';

export const formDataToResources = (formData: FormData): Resource[] => {
    const resources: Resource[] = [];
    if (formData.users.root) {
        resources.push('user');
    }
    if (formData.users.teams) {
        resources.push('team');
        resources.push('teammembership');
    }
    if (formData.databases.root) {
        resources.push('database');
    }
    if (formData.databases.documents) {
        resources.push('collection');
        resources.push('document');
    }
    if (formData.functions.root) {
        resources.push('function');
    }
    if (formData.functions.env) {
        resources.push('envvar');
    }
    if (formData.functions.inactive) {
        resources.push('deployment');
    }
    if (formData.storage.root) {
        resources.push('bucket');
        resources.push('file');
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
