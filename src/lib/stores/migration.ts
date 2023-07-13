import { excludeArray } from '$lib/helpers/array';
import { writable } from 'svelte/store';

export type Provider = 'appwrite' | 'nhost' | 'supabase' | 'firebase';

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
export type MigrationFormData = typeof initialFormData;

export const createMigrationFormStore = () => {
    const store = writable({ ...initialFormData });
    const reset = () => {
        store.set({ ...initialFormData });
    };

    return {
        ...store,
        reset
    };
};

const resources = [
    'user',
    'team',
    'membership',
    'file',
    'bucket',
    'function',
    'envVar',
    'deployment',
    'database',
    'collection',
    'index',
    'attribute',
    'document'
] as const;

type Resource = (typeof resources)[number];

export const providerResources: Record<Provider, Resource[]> = {
    appwrite: [...resources],
    supabase: [
        'user',
        'database',
        'collection',
        'attribute',
        'index',
        'document',
        'bucket',
        'file'
    ],
    nhost: ['user', 'database', 'collection', 'attribute', 'index', 'document', 'bucket', 'file'],
    firebase: []
};

export const migrationFormToResources = (formData: MigrationFormData): Resource[] => {
    const resources: Resource[] = [];
    if (formData.users.root) {
        resources.push('user');
    }
    if (formData.users.teams) {
        resources.push('team');
        resources.push('membership');
    }
    if (formData.databases.root) {
        resources.push('database');
    }
    if (formData.databases.documents) {
        resources.push('collection');
        resources.push('attribute');
        resources.push('index');
        resources.push('document');
    }
    if (formData.functions.root) {
        resources.push('function');
    }
    if (formData.functions.env) {
        resources.push('envVar');
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
