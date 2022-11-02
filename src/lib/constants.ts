export const PAGE_LIMIT = 12; // default page limit
export const CARD_LIMIT = 6; // default card limit
export enum Dependencies {
    PROJECT = 'project',
    PROJECTS = 'projects',
    ACCOUNT = 'account',
    ACCOUNT_SESSIONS = 'account_sessions',
    USER = 'user',
    USERS = 'users',
    SESSIONS = 'sessions',
    TEAM = 'team',
    TEAMS = 'teams',
    MEMBERSHIPS = 'memberships',
    DATABASE = 'database',
    COLLECTION = 'collection',
    DOCUMENT = 'document',
    DOCUMENTS = 'documents',
    ATTRIBUTES = 'attributes',
    INDEXES = 'indexes',
    BUCKET = 'bucket',
    FILE = 'file',
    FILES = 'files',
    FUNCTION = 'function',
    FUNCTIONS = 'functions',
    VARIABLES = 'variables',
    DEPLOYMENTS = 'deployments',
    PLATFORM = 'platform',
    PLATFORMS = 'platforms',
    KEY = 'key',
    KEYS = 'keys',
    DOMAINS = 'domains',
    WEBHOOK = 'webhook',
    WEBHOOKS = 'webhooks'
}

export const scopes = [
    {
        scope: 'users.read',
        description: "Access to read your project's users",
        category: 'Authentication'
    },
    {
        scope: 'users.write',
        description: "Access to create, update, and delete your project's users",
        category: 'Authentication'
    },
    {
        scope: 'teams.read',
        description: "Access to read your project's teams",
        category: 'Authentication'
    },
    {
        scope: 'teams.write',
        description: "Access to create, update, and delete your project's teams",
        category: 'Authentication'
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
    }
];
