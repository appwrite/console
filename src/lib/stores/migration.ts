import { writable } from 'svelte/store';

import { includesAll } from '$lib/helpers/array';

const initialFormData = {
    users: {
        root: false,
        teams: false
    },
    databases: {
        root: false,
        rows: false
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

export const ResourcesFriendly = {
    user: { singular: 'User', plural: 'Users' },
    team: { singular: 'Team', plural: 'Teams' },
    membership: { singular: 'Membership', plural: 'Memberships' },
    file: { singular: 'File', plural: 'Files' },
    bucket: { singular: 'Bucket', plural: 'Buckets' },
    function: { singular: 'Function', plural: 'Functions' },
    'environment-variable': { singular: 'Environment Variable', plural: 'Environment Variables' },
    deployment: { singular: 'Deployment', plural: 'Deployments' },
    database: { singular: 'Database', plural: 'Databases' },
    table: { singular: 'Table', plural: 'Tables' },
    index: { singular: 'Index', plural: 'Indexes' },
    column: { singular: 'Column', plural: 'Columns' },
    row: { singular: 'Row', plural: 'Rows' }
};

const resources = Object.keys(ResourcesFriendly);

type Resource = (typeof resources)[number];

// @todo: @itznotabug - check if other resources are correct and work fine!
export const providerResources: Record<Provider, Resource[]> = {
    appwrite: [...resources], // new terminology, others are ok?
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
    firebase: ['user', 'database', 'collection', 'attribute', 'document', 'bucket', 'file']
};

export const migrationFormToResources = (
    formData: MigrationFormData,
    provider: Provider
): Resource[] => {
    const resources: Resource[] = [];
    const addResource = (resource: Resource) => {
        if (providerResources[provider].includes(resource)) {
            resources.push(resource);
        }
    };

    if (formData.users.root) {
        addResource('user');
    }
    if (formData.users.teams) {
        addResource('team');
        addResource('membership');
    }
    if (formData.databases.root) {
        addResource('database');
        addResource('table');
        addResource('column');
        addResource('columnIndex');
    }
    if (formData.databases.rows) {
        addResource('row');
    }
    if (formData.functions.root) {
        addResource('function');
    }
    if (formData.functions.env) {
        addResource('environment-variable');
    }
    if (formData.functions.inactive) {
        addResource('deployment');
    }
    if (formData.storage.root) {
        addResource('bucket');
        addResource('file');
    }

    return resources;
};

const compareVersions = (a: string, b: string) => {
    const aParts = a.split('.');
    const bParts = b.split('.');
    const maxLength = Math.max(aParts.length, bParts.length);
    for (let i = 0; i < maxLength; i++) {
        const aPart = aParts[i] ? parseInt(aParts[i]) : 0;
        const bPart = bParts[i] ? parseInt(bParts[i]) : 0;
        if (aPart > bPart) {
            return 1;
        }
        if (aPart < bPart) {
            return -1;
        }
    }
    return 0;
};

export const isVersionAtLeast = (version: string, atLeast: string) => {
    return compareVersions(version, atLeast) >= 0;
};

export const resourcesToMigrationForm = (
    resources: Resource[],
    version = '0.0.0'
): MigrationFormData => {
    const formData = { ...initialFormData };
    if (resources.includes('user')) {
        formData.users.root = true;
    }
    if (includesAll(resources, ['team', 'membership'])) {
        formData.users.teams = true;
    }
    if (resources.includes('database')) {
        formData.databases.root = true;
    }
    if (includesAll(resources, ['table', 'column', 'row'])) {
        formData.databases.rows = true;
    }
    if (resources.includes('function') && isVersionAtLeast(version, '1.4.0')) {
        formData.functions.root = true;
    }
    if (resources.includes('environment-variable') && isVersionAtLeast(version, '1.4.0')) {
        formData.functions.env = true;
    }
    if (resources.includes('deployment') && isVersionAtLeast(version, '1.4.0')) {
        formData.functions.inactive = true;
    }
    if (includesAll(resources, ['bucket', 'file'])) {
        formData.storage.root = true;
    }

    return formData;
};

type AppwriteInput = {
    provider: 'appwrite';
    endpoint?: string;
    projectID?: string;
    apiKey?: string;
};

type FirebaseInput = {
    provider: 'firebase';
    serviceAccount?: string;
    projectId?: string;
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

export type ProviderInput = AppwriteInput | NhostInput | SupabaseInput | FirebaseInput;
export type Provider = ProviderInput['provider'];

const initialProvider: ProviderInput = { provider: 'appwrite' };
export const createMigrationProviderStore = () => {
    const store = writable<ProviderInput>({ ...initialProvider });

    const changeProvider = (provider: Provider) => {
        const newProvider: ProviderInput = { provider };
        store.set(newProvider);
    };

    return {
        ...store,
        changeProvider
    };
};
