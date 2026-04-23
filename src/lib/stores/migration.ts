import { writable } from 'svelte/store';
import {
    AppwriteMigrationResource,
    FirebaseMigrationResource,
    NHostMigrationResource,
    SupabaseMigrationResource
} from '@appwrite.io/console';
import { includesAll } from '$lib/helpers/array';

export type MigrationResource =
    | AppwriteMigrationResource
    | FirebaseMigrationResource
    | NHostMigrationResource
    | SupabaseMigrationResource;

// Appwrite enum is the superset of all provider resources — used as a
// provider-agnostic reference. The addResource guard filters by provider.
export const MigrationResources = AppwriteMigrationResource;

type ProviderResourceMap = {
    appwrite: AppwriteMigrationResource[];
    supabase: SupabaseMigrationResource[];
    nhost: NHostMigrationResource[];
    firebase: FirebaseMigrationResource[];
};

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
        deploymentInactive: false
    },
    storage: {
        root: false
    },
    sites: {
        root: false,
        deploymentInactive: false
    },
    messaging: {
        root: false,
        messages: false
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
    row: { singular: 'Row', plural: 'Rows' },
    site: { singular: 'Site', plural: 'Sites' },
    'site-deployment': { singular: 'Site Deployment', plural: 'Site Deployments' },
    'site-variable': { singular: 'Site Variable', plural: 'Site Variables' },
    provider: { singular: 'Provider', plural: 'Providers' },
    topic: { singular: 'Topic', plural: 'Topics' },
    subscriber: { singular: 'Subscriber', plural: 'Subscribers' },
    message: { singular: 'Message', plural: 'Messages' }
};

export const providerResources: ProviderResourceMap = {
    appwrite: Object.values(AppwriteMigrationResource),
    supabase: Object.values(SupabaseMigrationResource),
    nhost: Object.values(NHostMigrationResource),
    firebase: Object.values(FirebaseMigrationResource)
};

export const migrationFormToResources = <P extends Provider>(
    formData: MigrationFormData,
    provider: P
): ProviderResourceMap[P] => {
    const resources: MigrationResource[] = [];
    const providerValues = providerResources[provider] as MigrationResource[];
    const addResource = (resource: MigrationResource) => {
        if (providerValues.includes(resource)) {
            resources.push(resource);
        }
    };

    if (formData.users.root) {
        addResource(MigrationResources.User);
        if (formData.users.teams) {
            addResource(MigrationResources.Team);
            addResource(MigrationResources.Membership);
        }
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
    if (formData.functions.root) {
        addResource(MigrationResources.Function);
        addResource(MigrationResources.Environmentvariable);
        if (formData.functions.deploymentInactive) {
            addResource(MigrationResources.Deployment);
        }
    }
    if (formData.sites.root) {
        addResource(MigrationResources.Site);
        addResource(MigrationResources.Sitevariable);
        if (formData.sites.deploymentInactive) {
            addResource(MigrationResources.Sitedeployment);
        }
    }
    if (formData.messaging.root) {
        addResource(MigrationResources.Provider);
        addResource(MigrationResources.Topic);
        addResource(MigrationResources.Subscriber);
    }
    if (formData.messaging.messages) {
        addResource(MigrationResources.Message);
    }

    return resources as ProviderResourceMap[P];
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
    if (
        includesAll(resources, [
            MigrationResources.Team,
            MigrationResources.Membership
        ] as MigrationResource[])
    ) {
        formData.users.teams = true;
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
    if (resources.includes(MigrationResources.Function)) {
        formData.functions.root = true;
    }
    if (resources.includes(MigrationResources.Deployment)) {
        formData.functions.deploymentInactive = true;
    }
    if (resources.includes(MigrationResources.Site)) {
        formData.sites.root = true;
    }
    if (resources.includes(MigrationResources.Sitedeployment)) {
        formData.sites.deploymentInactive = true;
    }
    if (resources.includes(MigrationResources.Provider)) {
        formData.messaging.root = true;
    }
    if (resources.includes(MigrationResources.Message)) {
        formData.messaging.messages = true;
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
