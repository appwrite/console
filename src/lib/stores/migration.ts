import { writable } from 'svelte/store';
import {
    AppwriteMigrationResource,
    FirebaseMigrationResource,
    NHostMigrationResource,
    SupabaseMigrationResource
} from '@appwrite.io/console';
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

export const MigrationResources = AppwriteMigrationResource;

export type MigrationResource =
    | AppwriteMigrationResource
    | FirebaseMigrationResource
    | SupabaseMigrationResource
    | NHostMigrationResource;

export const providerResources: Record<Provider, MigrationResource[]> = {
    appwrite: Object.values(AppwriteMigrationResource),
    supabase: Object.values(SupabaseMigrationResource),
    nhost: Object.values(NHostMigrationResource),
    firebase: Object.values(FirebaseMigrationResource)
};

export const migrationFormToResources = (
    formData: MigrationFormData,
    provider: Provider
): MigrationResource[] => {
    const resources: MigrationResource[] = [];
    const addResource = (resource: MigrationResource) => {
        if (providerResources[provider].includes(resource)) {
            resources.push(resource);
        }
    };

    if (formData.users.root) {
        addResource(MigrationResources.User);
    }
    if (formData.databases.root) {
        addResource(MigrationResources.Database);
        addResource(MigrationResources.Table);
        addResource(MigrationResources.Column);
        addResource(MigrationResources.Index);
    }
    if (formData.databases.rows) {
        addResource(MigrationResources.Row);
    }
    if (formData.storage.root) {
        addResource(MigrationResources.Bucket);
        addResource(MigrationResources.File);
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

export const resourcesToMigrationForm = (resources: MigrationResource[]): MigrationFormData => {
    const formData = { ...initialFormData };
    if (resources.includes(MigrationResources.User)) {
        formData.users.root = true;
    }
    if (resources.includes(MigrationResources.Database)) {
        formData.databases.root = true;
    }
    if (
        includesAll(resources, [
            MigrationResources.Table,
            MigrationResources.Column,
            MigrationResources.Row
        ] as MigrationResource[])
    ) {
        formData.databases.rows = true;
    }
    if (
        includesAll(resources, [
            MigrationResources.Bucket,
            MigrationResources.File
        ] as MigrationResource[])
    ) {
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
