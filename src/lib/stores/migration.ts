import { writable } from 'svelte/store';
import { Resources } from '@appwrite.io/console';
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

// @todo: @itznotabug - check if other resources are correct and work fine!
export const providerResources: Record<Provider, Resources[]> = {
    appwrite: Object.values(Resources),
    supabase: [
        Resources.User,
        Resources.Database,
        Resources.Collection,
        Resources.Attribute,
        Resources.Index,
        Resources.Document,
        Resources.Bucket,
        Resources.File
    ],
    nhost: [
        Resources.User,
        Resources.Database,
        Resources.Collection,
        Resources.Attribute,
        Resources.Index,
        Resources.Document,
        Resources.Bucket,
        Resources.File
    ],
    firebase: [
        Resources.User,
        Resources.Database,
        Resources.Collection,
        Resources.Attribute,
        Resources.Document,
        Resources.Bucket,
        Resources.File
    ]
};

export const migrationFormToResources = (
    formData: MigrationFormData,
    provider: Provider
): Resources[] => {
    const resources: Resources[] = [];
    const addResource = (resource: Resources) => {
        if (providerResources[provider].includes(resource)) {
            resources.push(resource);
        }
    };

    if (formData.users.root) {
        addResource(Resources.User);
    }
    if (formData.databases.root) {
        addResource(Resources.Database);
        addResource(Resources.Table);
        addResource(Resources.Column);
        addResource(Resources.Index);
    }
    if (formData.databases.rows) {
        addResource(Resources.Row);
    }
    if (formData.storage.root) {
        addResource(Resources.Bucket);
        addResource(Resources.File);
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

export const resourcesToMigrationForm = (resources: Resources[]): MigrationFormData => {
    const formData = { ...initialFormData };
    if (resources.includes(Resources.User)) {
        formData.users.root = true;
    }
    if (resources.includes(Resources.Database)) {
        formData.databases.root = true;
    }
    if (includesAll(resources, [Resources.Table, Resources.Column, Resources.Row] as Resources[])) {
        formData.databases.rows = true;
    }
    if (includesAll(resources, [Resources.Bucket, Resources.File] as Resources[])) {
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
