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
    | SupabaseMigrationResource
    | 'platform'
    | 'api-key'
    | 'project-variable'
    | 'webhook'
    | 'auth-methods'
    | 'oauth2-amazon'
    | 'oauth2-apple'
    | 'oauth2-auth0'
    | 'oauth2-authentik'
    | 'oauth2-autodesk'
    | 'oauth2-bitbucket'
    | 'oauth2-bitly'
    | 'oauth2-box'
    | 'oauth2-dailymotion'
    | 'oauth2-discord'
    | 'oauth2-disqus'
    | 'oauth2-dropbox'
    | 'oauth2-etsy'
    | 'oauth2-facebook'
    | 'oauth2-figma'
    | 'oauth2-fusionauth'
    | 'oauth2-github'
    | 'oauth2-gitlab'
    | 'oauth2-google'
    | 'oauth2-keycloak'
    | 'oauth2-kick'
    | 'oauth2-linkedin'
    | 'oauth2-microsoft'
    | 'oauth2-notion'
    | 'oauth2-oidc'
    | 'oauth2-okta'
    | 'oauth2-paypal'
    | 'oauth2-podio'
    | 'oauth2-salesforce'
    | 'oauth2-slack'
    | 'oauth2-spotify'
    | 'oauth2-stripe'
    | 'oauth2-tradeshift'
    | 'oauth2-twitch'
    | 'oauth2-wordpress'
    | 'oauth2-x'
    | 'oauth2-yahoo'
    | 'oauth2-yandex'
    | 'oauth2-zoho'
    | 'oauth2-zoom'
    | 'project-protocols'
    | 'project-labels'
    | 'project-services'
    | 'project-email-template'
    | 'policies'
    | 'smtp'
    | 'rule';

// Appwrite enum is the superset of all provider resources — used as a
// provider-agnostic reference. The addResource guard filters by provider.
// Project-level singleton resources are augmented locally until @appwrite.io/console
// SDK is regenerated.
export const MigrationResources = {
    ...AppwriteMigrationResource,
    Platform: 'platform',
    ApiKey: 'api-key',
    ProjectVariable: 'project-variable',
    Webhook: 'webhook',
    AuthMethods: 'auth-methods',
    OAuth2Amazon: 'oauth2-amazon',
    OAuth2Apple: 'oauth2-apple',
    OAuth2Auth0: 'oauth2-auth0',
    OAuth2Authentik: 'oauth2-authentik',
    OAuth2Autodesk: 'oauth2-autodesk',
    OAuth2Bitbucket: 'oauth2-bitbucket',
    OAuth2Bitly: 'oauth2-bitly',
    OAuth2Box: 'oauth2-box',
    OAuth2Dailymotion: 'oauth2-dailymotion',
    OAuth2Discord: 'oauth2-discord',
    OAuth2Disqus: 'oauth2-disqus',
    OAuth2Dropbox: 'oauth2-dropbox',
    OAuth2Etsy: 'oauth2-etsy',
    OAuth2Facebook: 'oauth2-facebook',
    OAuth2Figma: 'oauth2-figma',
    OAuth2FusionAuth: 'oauth2-fusionauth',
    OAuth2Github: 'oauth2-github',
    OAuth2Gitlab: 'oauth2-gitlab',
    OAuth2Google: 'oauth2-google',
    OAuth2Keycloak: 'oauth2-keycloak',
    OAuth2Kick: 'oauth2-kick',
    OAuth2Linkedin: 'oauth2-linkedin',
    OAuth2Microsoft: 'oauth2-microsoft',
    OAuth2Notion: 'oauth2-notion',
    OAuth2Oidc: 'oauth2-oidc',
    OAuth2Okta: 'oauth2-okta',
    OAuth2Paypal: 'oauth2-paypal',
    OAuth2Podio: 'oauth2-podio',
    OAuth2Salesforce: 'oauth2-salesforce',
    OAuth2Slack: 'oauth2-slack',
    OAuth2Spotify: 'oauth2-spotify',
    OAuth2Stripe: 'oauth2-stripe',
    OAuth2Tradeshift: 'oauth2-tradeshift',
    OAuth2Twitch: 'oauth2-twitch',
    OAuth2Wordpress: 'oauth2-wordpress',
    OAuth2X: 'oauth2-x',
    OAuth2Yahoo: 'oauth2-yahoo',
    OAuth2Yandex: 'oauth2-yandex',
    OAuth2Zoho: 'oauth2-zoho',
    OAuth2Zoom: 'oauth2-zoom',
    Protocols: 'project-protocols',
    Labels: 'project-labels',
    Services: 'project-services',
    Policies: 'policies',
    SMTP: 'smtp',
    Rule: 'rule',
    EmailTemplate: 'project-email-template'
} as const;

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
    },
    backups: {
        root: false
    },
    authMethods: {
        root: false
    },
    oauthProviders: {
        root: false
    },
    protocols: {
        root: false
    },
    labels: {
        root: false
    },
    services: {
        root: false
    },
    policies: {
        root: false
    },
    smtp: {
        root: false
    },
    customDomains: {
        root: false
    },
    emailTemplates: {
        root: false
    },
    integrations: {
        root: false,
        apiKeys: false
    },
    settings: {
        root: false,
        webhooks: false
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
    message: { singular: 'Message', plural: 'Messages' },
    'backup-policy': { singular: 'Backup Policy', plural: 'Backup Policies' },
    platform: { singular: 'Platform', plural: 'Platforms' },
    'api-key': { singular: 'API Key', plural: 'API Keys' },
    'project-variable': { singular: 'Project Variable', plural: 'Project Variables' },
    webhook: { singular: 'Webhook', plural: 'Webhooks' },
    'auth-methods': { singular: 'Auth method config', plural: 'Auth method config' },
    'oauth-providers': { singular: 'OAuth provider config', plural: 'OAuth provider config' },
    'project-protocols': { singular: 'Protocol config', plural: 'Protocol config' },
    'project-labels': { singular: 'Project labels', plural: 'Project labels' },
    'project-services': { singular: 'Services config', plural: 'Services config' },
    policies: { singular: 'Policies config', plural: 'Policies config' },
    smtp: { singular: 'SMTP config', plural: 'SMTP config' },
    rule: { singular: 'Custom domain', plural: 'Custom domains' },
    'project-email-template': { singular: 'Email template', plural: 'Email templates' }
};

export const providerResources: ProviderResourceMap = {
    appwrite: [
        ...Object.values(AppwriteMigrationResource),
        MigrationResources.AuthMethods as AppwriteMigrationResource,
        MigrationResources.OAuth2Amazon as AppwriteMigrationResource,
        MigrationResources.OAuth2Apple as AppwriteMigrationResource,
        MigrationResources.OAuth2Auth0 as AppwriteMigrationResource,
        MigrationResources.OAuth2Authentik as AppwriteMigrationResource,
        MigrationResources.OAuth2Autodesk as AppwriteMigrationResource,
        MigrationResources.OAuth2Bitbucket as AppwriteMigrationResource,
        MigrationResources.OAuth2Bitly as AppwriteMigrationResource,
        MigrationResources.OAuth2Box as AppwriteMigrationResource,
        MigrationResources.OAuth2Dailymotion as AppwriteMigrationResource,
        MigrationResources.OAuth2Discord as AppwriteMigrationResource,
        MigrationResources.OAuth2Disqus as AppwriteMigrationResource,
        MigrationResources.OAuth2Dropbox as AppwriteMigrationResource,
        MigrationResources.OAuth2Etsy as AppwriteMigrationResource,
        MigrationResources.OAuth2Facebook as AppwriteMigrationResource,
        MigrationResources.OAuth2Figma as AppwriteMigrationResource,
        MigrationResources.OAuth2FusionAuth as AppwriteMigrationResource,
        MigrationResources.OAuth2Github as AppwriteMigrationResource,
        MigrationResources.OAuth2Gitlab as AppwriteMigrationResource,
        MigrationResources.OAuth2Google as AppwriteMigrationResource,
        MigrationResources.OAuth2Keycloak as AppwriteMigrationResource,
        MigrationResources.OAuth2Kick as AppwriteMigrationResource,
        MigrationResources.OAuth2Linkedin as AppwriteMigrationResource,
        MigrationResources.OAuth2Microsoft as AppwriteMigrationResource,
        MigrationResources.OAuth2Notion as AppwriteMigrationResource,
        MigrationResources.OAuth2Oidc as AppwriteMigrationResource,
        MigrationResources.OAuth2Okta as AppwriteMigrationResource,
        MigrationResources.OAuth2Paypal as AppwriteMigrationResource,
        MigrationResources.OAuth2Podio as AppwriteMigrationResource,
        MigrationResources.OAuth2Salesforce as AppwriteMigrationResource,
        MigrationResources.OAuth2Slack as AppwriteMigrationResource,
        MigrationResources.OAuth2Spotify as AppwriteMigrationResource,
        MigrationResources.OAuth2Stripe as AppwriteMigrationResource,
        MigrationResources.OAuth2Tradeshift as AppwriteMigrationResource,
        MigrationResources.OAuth2Twitch as AppwriteMigrationResource,
        MigrationResources.OAuth2Wordpress as AppwriteMigrationResource,
        MigrationResources.OAuth2X as AppwriteMigrationResource,
        MigrationResources.OAuth2Yahoo as AppwriteMigrationResource,
        MigrationResources.OAuth2Yandex as AppwriteMigrationResource,
        MigrationResources.OAuth2Zoho as AppwriteMigrationResource,
        MigrationResources.OAuth2Zoom as AppwriteMigrationResource,
        MigrationResources.Protocols as AppwriteMigrationResource,
        MigrationResources.Labels as AppwriteMigrationResource,
        MigrationResources.Services as AppwriteMigrationResource,
        MigrationResources.Policies as AppwriteMigrationResource,
        MigrationResources.SMTP as AppwriteMigrationResource,
        MigrationResources.Rule as AppwriteMigrationResource,
        MigrationResources.EmailTemplate as AppwriteMigrationResource,
        MigrationResources.Platform as AppwriteMigrationResource,
        MigrationResources.ApiKey as AppwriteMigrationResource,
        MigrationResources.ProjectVariable as AppwriteMigrationResource,
        MigrationResources.Webhook as AppwriteMigrationResource
    ],
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
    if (formData.backups.root) {
        addResource(MigrationResources.Backuppolicy);
    }
    if (formData.authMethods.root) {
        addResource(MigrationResources.AuthMethods);
    }
    if (formData.oauthProviders.root) {
        addResource(MigrationResources.OAuth2Amazon);
        addResource(MigrationResources.OAuth2Apple);
        addResource(MigrationResources.OAuth2Auth0);
        addResource(MigrationResources.OAuth2Authentik);
        addResource(MigrationResources.OAuth2Autodesk);
        addResource(MigrationResources.OAuth2Bitbucket);
        addResource(MigrationResources.OAuth2Bitly);
        addResource(MigrationResources.OAuth2Box);
        addResource(MigrationResources.OAuth2Dailymotion);
        addResource(MigrationResources.OAuth2Discord);
        addResource(MigrationResources.OAuth2Disqus);
        addResource(MigrationResources.OAuth2Dropbox);
        addResource(MigrationResources.OAuth2Etsy);
        addResource(MigrationResources.OAuth2Facebook);
        addResource(MigrationResources.OAuth2Figma);
        addResource(MigrationResources.OAuth2FusionAuth);
        addResource(MigrationResources.OAuth2Github);
        addResource(MigrationResources.OAuth2Gitlab);
        addResource(MigrationResources.OAuth2Google);
        addResource(MigrationResources.OAuth2Keycloak);
        addResource(MigrationResources.OAuth2Kick);
        addResource(MigrationResources.OAuth2Linkedin);
        addResource(MigrationResources.OAuth2Microsoft);
        addResource(MigrationResources.OAuth2Notion);
        addResource(MigrationResources.OAuth2Oidc);
        addResource(MigrationResources.OAuth2Okta);
        addResource(MigrationResources.OAuth2Paypal);
        addResource(MigrationResources.OAuth2Podio);
        addResource(MigrationResources.OAuth2Salesforce);
        addResource(MigrationResources.OAuth2Slack);
        addResource(MigrationResources.OAuth2Spotify);
        addResource(MigrationResources.OAuth2Stripe);
        addResource(MigrationResources.OAuth2Tradeshift);
        addResource(MigrationResources.OAuth2Twitch);
        addResource(MigrationResources.OAuth2Wordpress);
        addResource(MigrationResources.OAuth2X);
        addResource(MigrationResources.OAuth2Yahoo);
        addResource(MigrationResources.OAuth2Yandex);
        addResource(MigrationResources.OAuth2Zoho);
        addResource(MigrationResources.OAuth2Zoom);
    }
    if (formData.protocols.root) {
        addResource(MigrationResources.Protocols);
    }
    if (formData.labels.root) {
        addResource(MigrationResources.Labels);
    }
    if (formData.services.root) {
        addResource(MigrationResources.Services);
    }
    if (formData.policies.root) {
        addResource(MigrationResources.Policies);
    }
    if (formData.smtp.root) {
        addResource(MigrationResources.SMTP);
    }
    if (formData.customDomains.root) {
        addResource(MigrationResources.Rule);
    }
    if (formData.emailTemplates.root) {
        addResource(MigrationResources.EmailTemplate);
    }
    if (formData.integrations.root) {
        addResource(MigrationResources.Platform);
        if (formData.integrations.apiKeys) {
            addResource(MigrationResources.ApiKey);
        }
    }
    if (formData.settings.root) {
        addResource(MigrationResources.ProjectVariable);
        if (formData.settings.webhooks) {
            addResource(MigrationResources.Webhook);
        }
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
    if (resources.includes(MigrationResources.Backuppolicy)) {
        formData.backups.root = true;
    }
    if (resources.includes(MigrationResources.AuthMethods)) {
        formData.authMethods.root = true;
    }
    if (resources.some((r) => typeof r === 'string' && r.startsWith('oauth2-'))) {
        formData.oauthProviders.root = true;
    }
    if (resources.includes(MigrationResources.Protocols)) {
        formData.protocols.root = true;
    }
    if (resources.includes(MigrationResources.Labels)) {
        formData.labels.root = true;
    }
    if (resources.includes(MigrationResources.Services)) {
        formData.services.root = true;
    }
    if (resources.includes(MigrationResources.Policies)) {
        formData.policies.root = true;
    }
    if (resources.includes(MigrationResources.SMTP)) {
        formData.smtp.root = true;
    }
    if (resources.includes(MigrationResources.Rule)) {
        formData.customDomains.root = true;
    }
    if (resources.includes(MigrationResources.EmailTemplate)) {
        formData.emailTemplates.root = true;
    }
    if (resources.includes(MigrationResources.Platform)) {
        formData.integrations.root = true;
    }
    if (resources.includes(MigrationResources.ApiKey)) {
        formData.integrations.root = true;
        formData.integrations.apiKeys = true;
    }
    if (resources.includes(MigrationResources.ProjectVariable)) {
        formData.settings.root = true;
    }
    if (resources.includes(MigrationResources.Webhook)) {
        formData.settings.root = true;
        formData.settings.webhooks = true;
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
