export const PAGE_LIMIT = 12; // default page limit
export const CARD_LIMIT = 6; // default card limit
export const INTERVAL = 5 * 60000; // default interval to check for feedback
export const NEW_DEV_PRO_UPGRADE_COUPON = 'appw50';

export const REGION_FRA = 'fra';
export const REGION_SYD = 'syd';
export const REGION_NYC = 'nyc';

export const SUBDOMAIN_FRA = 'fra.';
export const SUBDOMAIN_SYD = 'syd.';
export const SUBDOMAIN_NYC = 'nyc.';

export enum Dependencies {
    FACTORS = 'dependency:factors',
    IDENTITIES = 'dependency:identities',
    CREDIT = 'dependency:credit',
    INVOICES = 'dependency:invoices',
    ADDRESS = 'dependency:address',
    UPGRADE_PLAN = 'dependency:upgrade_plan',
    PAYMENT_METHODS = 'dependency:paymentMethods',
    ORGANIZATION = 'dependency:organization',
    MEMBERS = 'dependency:members',
    PROJECT = 'dependency:project',
    PROJECT_VARIABLES = 'dependency:project_variables',
    PROJECT_INSTALLATIONS = 'dependency:project_installations',
    PROJECTS = 'dependency:projects',
    ACCOUNT = 'dependency:account',
    ACCOUNT_SESSIONS = 'dependency:account_sessions',
    USER = 'dependency:user',
    USERS = 'dependency:users',
    USER_IDENTITIES = 'dependency:user_identities',
    USER_TARGETS = 'dependency:user_targets',
    SESSIONS = 'dependency:sessions',
    TEAM = 'dependency:team',
    TEAMS = 'dependency:teams',
    MEMBERSHIPS = 'dependency:memberships',
    DATABASE = 'dependency:database',
    DATABASES = 'dependency:databases',
    COLLECTION = 'dependency:collection',
    DOCUMENT = 'dependency:document',
    DOCUMENTS = 'dependency:documents',
    BUCKET = 'dependency:bucket',
    FILE = 'dependency:file',
    FILE_TOKENS = 'dependency:file_tokens',
    FILES = 'dependency:files',
    FUNCTION = 'dependency:function',
    FUNCTION_DOMAINS = 'dependency:function_domains',
    FUNCTION_INSTALLATIONS = 'dependency:function_installations',
    FUNCTIONS = 'dependency:functions',
    VARIABLES = 'dependency:variables',
    DEPLOYMENT = 'dependency:deployment',
    DEPLOYMENTS = 'dependency:deployments',
    EXECUTIONS = 'dependency:executions',
    PLATFORM = 'dependency:platform',
    PLATFORMS = 'dependency:platforms',
    KEY = 'dependency:key',
    KEYS = 'dependency:keys',
    DOMAINS = 'dependency:domains',
    DOMAIN = 'dependency:domains',
    WEBHOOK = 'dependency:webhook',
    WEBHOOKS = 'dependency:webhooks',
    MIGRATIONS = 'dependency:migrations',
    COLLECTIONS = 'dependency:collections',
    BACKUPS = 'dependency:backups',
    RUNTIMES = 'dependency:runtimes',
    CONSOLE_VARIABLES = 'dependency:console_variables',
    MESSAGING_PROVIDERS = 'dependency:messaging_providers',
    MESSAGING_PROVIDER = 'dependency:messaging_provider',
    MESSAGING_MESSAGES = 'dependency:messaging_messages',
    MESSAGING_MESSAGE = 'dependency:messaging_message',
    MESSAGING_TOPICS = 'dependency:messaging_topics',
    MESSAGING_TOPIC = 'dependency:messaging_topic',
    MESSAGING_TOPIC_SUBSCRIBERS = 'dependency:messaging_topic_subscribers',
    SITE = 'dependency:site',
    SITES = 'dependency:sites',
    SITES_DOMAINS = 'dependency:sites_domains'
}

export const defaultScopes: string[] = [
    'global',
    'public',
    'home',
    'console',
    'graphql',
    'sessions.write',
    'account',
    'teams.read',
    'teams.write',
    'documents.read',
    'documents.write',
    'files.read',
    'files.write',
    'projects.read',
    'projects.write',
    'locale.read',
    'avatars.read',
    'execution.read',
    'execution.write',
    'targets.read',
    'targets.write',
    'subscribers.write',
    'subscribers.read',
    'assistant.read',
    'users.read',
    'users.write',
    'databases.read',
    'databases.write',
    'collections.read',
    'collections.write',
    'buckets.read',
    'buckets.write',
    'functions.read',
    'functions.write',
    'platforms.read',
    'platforms.write',
    'keys.read',
    'keys.write',
    'webhooks.read',
    'webhooks.write',
    'rules.read',
    'rules.write',
    'migrations.read',
    'migrations.write',
    'vcs.read',
    'vcs.write',
    'providers.read',
    'providers.write',
    'messages.read',
    'messages.write',
    'topics.read',
    'topics.write',
    'billing.read',
    'billing.write',
    'sites.read',
    'sites.write'
];

export const defaultRoles: string[] = ['owner'];

export const scopes: {
    scope: string;
    description: string;
    category: string;
    icon: string;
}[] = [
    {
        scope: 'sessions.write',
        description: "Access to create, update and delete your project's sessions",
        category: 'Auth',
        icon: 'user-group'
    },
    {
        scope: 'users.read',
        description: "Access to read your project's users",
        category: 'Auth',
        icon: 'user-group'
    },
    {
        scope: 'users.write',
        description: "Access to create, update, and delete your project's users",
        category: 'Auth',
        icon: 'user-group'
    },
    {
        scope: 'teams.read',
        description: "Access to read your project's teams",
        category: 'Auth',
        icon: 'user-group'
    },
    {
        scope: 'teams.write',
        description: "Access to create, update, and delete your project's teams",
        category: 'Auth',
        icon: 'user-group'
    },
    {
        scope: 'databases.read',
        description: "Access to read your project's databases",
        category: 'Database',
        icon: 'database'
    },
    {
        scope: 'databases.write',
        description: "Access to create, update, and delete your project's databases",
        category: 'Database',
        icon: 'database'
    },
    {
        scope: 'collections.read',
        description: "Access to read your project's database collections",
        category: 'Database',
        icon: 'database'
    },
    {
        scope: 'collections.write',
        description: "Access to create, update, and delete your project's database collections",
        category: 'Database',
        icon: 'database'
    },
    {
        scope: 'attributes.read',
        description: "Access to read your project's database collection's attributes",
        category: 'Database',
        icon: 'database'
    },
    {
        scope: 'attributes.write',
        description:
            "Access to create, update, and delete your project's database collection's attributes",
        category: 'Database',
        icon: 'database'
    },
    {
        scope: 'indexes.read',
        description: "Access to read your project's database collection's indexes",
        category: 'Database',
        icon: 'database'
    },
    {
        scope: 'indexes.write',
        description:
            "Access to create, update, and delete your project's database collection's indexes",
        category: 'Database',
        icon: 'database'
    },
    {
        scope: 'documents.read',
        description: "Access to read your project's database documents",
        category: 'Database',
        icon: 'database'
    },
    {
        scope: 'documents.write',
        description: "Access to create, update, and delete your project's database documents",
        category: 'Database',
        icon: 'database'
    },
    {
        scope: 'files.read',
        description: "Access to read your project's storage files and preview images",
        category: 'Storage',
        icon: 'folder'
    },
    {
        scope: 'files.write',
        description: "Access to create, update, and delete your project's storage files",
        category: 'Storage',
        icon: 'folder'
    },
    {
        scope: 'buckets.read',
        description: "Access to read your project's storage buckets",
        category: 'Storage',
        icon: 'folder'
    },
    {
        scope: 'buckets.write',
        description: "Access to create, update, and delete your project's storage buckets",
        category: 'Storage',
        icon: 'folder'
    },
    {
        scope: 'functions.read',
        description: "Access to read your project's functions and code deployments",
        category: 'Functions',
        icon: 'lightning-bolt'
    },
    {
        scope: 'functions.write',
        description:
            "Access to create, update, and delete your project's functions and code deployments",
        category: 'Functions',
        icon: 'lightning-bolt'
    },
    {
        scope: 'execution.read',
        description: "Access to read your project's execution logs",
        category: 'Functions',
        icon: 'lightning-bolt'
    },
    {
        scope: 'execution.write',
        description: "Access to execute your project's functions",
        category: 'Functions',
        icon: 'lightning-bolt'
    },
    {
        scope: 'targets.read',
        description: "Access to read your project's messaging targets",
        category: 'Messaging',
        icon: 'send'
    },
    {
        scope: 'targets.write',
        description: "Access to create, update, and delete your project's messaging targets",
        category: 'Messaging',
        icon: 'send'
    },
    {
        scope: 'providers.read',
        description: "Access to read your project's messaging providers",
        category: 'Messaging',
        icon: 'send'
    },
    {
        scope: 'providers.write',
        description: "Access to create, update, and delete your project's messaging providers",
        category: 'Messaging',
        icon: 'send'
    },
    {
        scope: 'messages.read',
        description: "Access to read your project's messages",
        category: 'Messaging',
        icon: 'send'
    },
    {
        scope: 'messages.write',
        description: "Access to create, update, and delete your project's messages",
        category: 'Messaging',
        icon: 'send'
    },
    {
        scope: 'topics.read',
        description: "Access to read your project's messaging topics",
        category: 'Messaging',
        icon: 'send'
    },
    {
        scope: 'topics.write',
        description: "Access to create, update, and delete your project's messaging topics",
        category: 'Messaging',
        icon: 'send'
    },
    {
        scope: 'subscribers.read',
        description: "Access to read your project's messaging topic subscribers",
        category: 'Messaging',
        icon: 'send'
    },
    {
        scope: 'subscribers.write',
        description:
            "Access to create, update, and delete your project's messaging topic subscribers",
        category: 'Messaging',
        icon: 'send'
    },
    {
        scope: 'locale.read',
        description: "Access to access your project's Locale service",
        category: 'Other',
        icon: 'globe'
    },
    {
        scope: 'avatars.read',
        description: "Access to access your project's Avatars service",
        category: 'Other',
        icon: 'globe'
    },
    {
        scope: 'health.read',
        description: "Access to read your project's health status",
        category: 'Other',
        icon: 'globe'
    },
    {
        scope: 'migrations.read',
        description: "Access to read your project's migration status",
        category: 'Other',
        icon: 'globe'
    },
    {
        scope: 'migrations.write',
        description: 'Access to create migrations',
        category: 'Other',
        icon: 'globe'
    },
    {
        scope: 'sites.read',
        description: "Access to read your project's sites and deployments",
        category: 'Sites',
        icon: 'globe'
    },
    {
        scope: 'sites.write',
        description: "Access to create, update, and delete your project's sites and deployments",
        category: 'Sites',
        icon: 'globe'
    },
    {
        scope: 'log.read',
        description: "Access to read your sites's logs",
        category: 'Sites',
        icon: 'globe'
    },
    {
        scope: 'log.write',
        description: "Access to delete your site's logs",
        category: 'Sites',
        icon: 'globe'
    }
];

export type EventService = {
    name: string;
    resources: EventResource[];
    actions?: EventAction[];
};

export type EventResource = {
    name: string;
    actions?: EventAction[];
};

export type EventAction = {
    name: string;
    attributes?: string[];
};

export const eventServices: Array<EventService> = [
    {
        name: 'buckets',
        resources: [
            {
                name: 'files',
                actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
            }
        ],
        actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
    },
    {
        name: 'databases',
        resources: [
            {
                name: 'collections',
                actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
            },
            {
                name: 'documents',
                actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
            }
        ],
        actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
    },
    {
        name: 'functions',
        resources: [
            {
                name: 'deployments',
                actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
            },
            {
                name: 'executions',
                actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
            }
        ],
        actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
    },
    {
        name: 'teams',
        resources: [
            {
                name: 'memberships',
                actions: [
                    { name: 'create' },
                    { name: 'update', attributes: ['status'] },
                    { name: 'delete' }
                ]
            }
        ],
        actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
    },
    {
        name: 'users',
        resources: [
            { name: 'recovery', actions: [{ name: 'create' }, { name: 'delete' }] },
            { name: 'sessions', actions: [{ name: 'create' }, { name: 'delete' }] },
            { name: 'verification', actions: [{ name: 'create' }, { name: 'delete' }] }
        ],
        actions: [
            { name: 'create' },
            { name: 'update', attributes: ['email', 'name', 'password', 'status', 'prefs'] },
            { name: 'delete' }
        ]
    },
    {
        name: 'providers',
        resources: [],
        actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
    },
    {
        name: 'topics',
        resources: [
            {
                name: 'subscribers',
                actions: [{ name: 'create' }, { name: 'delete' }]
            }
        ],
        actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
    },
    {
        name: 'messages',
        resources: [],
        actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
    }
];

export enum BillingPlan {
    FREE = 'tier-0',
    PRO = 'tier-1',
    SCALE = 'tier-2',
    GITHUB_EDUCATION = 'auto-1',
    CUSTOM = 'cont-1',
    ENTERPRISE = 'ent-1'
}

export const feedbackDowngradeOptions = [
    {
        value: 'availableFeatures',
        label: "The available features don't meet my needs"
    },
    {
        value: 'traction',
        label: "My project isn't getting traction"
    },
    {
        value: 'bugs',
        label: 'I experienced bugs or unexpected outages while using the console'
    },
    {
        value: 'starter',
        label: 'The Free plan is enough for my projects'
    },
    {
        value: 'budget',
        label: "I don't have the budget"
    },
    {
        value: 'tryOut',
        label: 'I just wanted to try it out'
    },
    {
        value: 'alternative',
        label: 'I found an alternative/competitor to meet my needs'
    },
    {
        value: 'other',
        label: 'Other'
    }
];
