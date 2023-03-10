export const PAGE_LIMIT = 12; // default page limit
export const CARD_LIMIT = 6; // default card limit
export const INTERVAL = 5 * 60000; // default interval to check for feedback

export enum Mode {
    CLOUD = 'cloud',
    SELF_HOSTED = 'self-hosted'
}

export const growthEndpoint = import.meta.env.VITE_APPWRITE_GROWTH_ENDPOINT;

export enum Dependencies {
    ORGANIZATION = 'dependency:organization',
    PROJECT = 'dependency:project',
    PROJECTS = 'dependency:projects',
    ACCOUNT = 'dependency:account',
    ACCOUNT_SESSIONS = 'dependency:account_sessions',
    USER = 'dependency:user',
    USERS = 'dependency:users',
    SESSIONS = 'dependency:sessions',
    TEAM = 'dependency:team',
    TEAMS = 'dependency:teams',
    MEMBERSHIPS = 'dependency:memberships',
    DATABASE = 'dependency:database',
    COLLECTION = 'dependency:collection',
    DOCUMENT = 'dependency:document',
    DOCUMENTS = 'dependency:documents',
    BUCKET = 'dependency:bucket',
    FILE = 'dependency:file',
    FILES = 'dependency:files',
    FUNCTION = 'dependency:function',
    FUNCTIONS = 'dependency:functions',
    VARIABLES = 'dependency:variables',
    DEPLOYMENTS = 'dependency:deployments',
    EXECUTIONS = 'dependency:executions',
    PLATFORM = 'dependency:platform',
    PLATFORMS = 'dependency:platforms',
    KEY = 'dependency:key',
    KEYS = 'dependency:keys',
    WEBHOOK = 'dependency:webhook',
    WEBHOOKS = 'dependency:webhooks',
    RULES = 'dependency:rules'
}

export const scopes: {
    scope: string;
    description: string;
    category: string;
}[] = [
    {
        scope: 'users.read',
        description: "Access to read your project's users",
        category: 'Auth'
    },
    {
        scope: 'users.write',
        description: "Access to create, update, and delete your project's users",
        category: 'Auth'
    },
    {
        scope: 'teams.read',
        description: "Access to read your project's teams",
        category: 'Auth'
    },
    {
        scope: 'teams.write',
        description: "Access to create, update, and delete your project's teams",
        category: 'Auth'
    },
    {
        scope: 'databases.read',
        description: "Access to read your project's databases",
        category: 'Database'
    },
    {
        scope: 'databases.write',
        description: "Access to create, update, and delete your project's databases",
        category: 'Database'
    },
    {
        scope: 'collections.read',
        description: "Access to read your project's database collections",
        category: 'Database'
    },
    {
        scope: 'collections.write',
        description: "Access to create, update, and delete your project's database collections",
        category: 'Database'
    },
    {
        scope: 'attributes.read',
        description: "Access to read your project's database collection's attributes",
        category: 'Database'
    },
    {
        scope: 'attributes.write',
        description:
            "Access to create, update, and delete your project's database collection's attributes",
        category: 'Database'
    },
    {
        scope: 'indexes.read',
        description: "Access to read your project's database collection's indexes",
        category: 'Database'
    },
    {
        scope: 'indexes.write',
        description:
            "Access to create, update, and delete your project's database collection's indexes",
        category: 'Database'
    },
    {
        scope: 'documents.read',
        description: "Access to read your project's database documents",
        category: 'Database'
    },
    {
        scope: 'documents.write',
        description: "Access to create, update, and delete your project's database documents",
        category: 'Database'
    },
    {
        scope: 'files.read',
        description: "Access to read your project's storage files and preview images",
        category: 'Storage'
    },
    {
        scope: 'files.write',
        description: "Access to create, update, and delete your project's storage files",
        category: 'Storage'
    },
    {
        scope: 'buckets.read',
        description: "Access to read your project's storage buckets",
        category: 'Storage'
    },
    {
        scope: 'buckets.write',
        description: "Access to create, update, and delete your project's storage buckets",
        category: 'Storage'
    },
    {
        scope: 'functions.read',
        description: "Access to read your project's functions and code deployments",
        category: 'Functions'
    },
    {
        scope: 'functions.write',
        description:
            "Access to create, update, and delete your project's functions and code deployments",
        category: 'Functions'
    },
    {
        scope: 'execution.read',
        description: "Access to read your project's execution logs",
        category: 'Functions'
    },
    {
        scope: 'execution.write',
        description: "Access to execute your project's functions",
        category: 'Functions'
    },
    {
        scope: 'locale.read',
        description: "Access to access your project's Locale service",
        category: 'Other'
    },
    {
        scope: 'avatars.read',
        description: "Access to access your project's Avatars service",
        category: 'Other'
    },
    {
        scope: 'health.read',
        description: "Access to read your project's health status",
        category: 'Other'
    },
    {
        scope: 'rules.read',
        description: "Access to read your project's proxy rules",
        category: 'Other'
    },
    {
        scope: 'rules.write',
        description: "Access to create, update, and delete your project's proxy rules",
        category: 'Other'
    }
];
