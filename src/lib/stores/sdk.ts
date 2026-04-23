import { isMultiRegionSupported, VARS } from '$lib/system';
import { registerImpersonationClients, restoreImpersonation } from '$lib/appwrite/impersonation';
import {
    Account,
    Assistant,
    Avatars,
    Backups,
    Client,
    Console,
    Functions,
    Health,
    Locale,
    Messaging,
    Migrations,
    Project,
    Project as ProjectApi,
    Projects,
    Proxy,
    Storage,
    Teams,
    Users,
    Vcs,
    Sites,
    Tokens,
    TablesDB,
    Domains,
    Webhooks,
    /*DocumentsDB,*/
    Realtime,
    Organizations
} from '@appwrite.io/console';
import { buildRegionalV1Endpoint } from '$lib/helpers/apiEndpoint';
import { Sources } from '$lib/sdk/sources';
import { building } from '$app/environment';

export function getApiEndpoint(region?: string): string {
    if (building) return '';
    const url = new URL(
        VARS.APPWRITE_ENDPOINT ? VARS.APPWRITE_ENDPOINT : globalThis?.location?.toString()
    );

    return buildRegionalV1Endpoint(url.protocol, url.host, region, isMultiRegionSupported(url));
}

function createConsoleSdk(client: Client) {
    return {
        client,
        account: new Account(client),
        avatars: new Avatars(client),
        functions: new Functions(client),
        health: new Health(client),
        locale: new Locale(client),
        projects: new Projects(client),
        teams: new Teams(client),
        users: new Users(client),
        migrations: new Migrations(client),
        console: new Console(client),
        assistant: new Assistant(client),
        sources: new Sources(client),
        sites: new Sites(client),
        domains: new Domains(client),
        storage: new Storage(client),
        realtime: new Realtime(client),
        organizations: new Organizations(client)
    };
}

const endpoint = getApiEndpoint();

const clientConsole = new Client();
const clientConsoleOperator = new Client();
const scopedConsoleClient = new Client();

const clientProject = new Client();
const clientRealtime = new Client();

if (!building) {
    scopedConsoleClient.setProject('console');
    clientConsole.setEndpoint(endpoint).setProject('console');
    clientConsoleOperator.setEndpoint(endpoint).setProject('console');

    clientProject.setEndpoint(endpoint).setMode('admin');
    clientRealtime.setEndpoint(endpoint).setProject('console');

    registerImpersonationClients([
        clientConsole,
        scopedConsoleClient,
        clientProject,
        clientRealtime
    ]);
    restoreImpersonation();
}

const sdkForProject = {
    client: clientProject,
    account: new Account(clientProject),
    avatars: new Avatars(clientProject),
    backups: new Backups(clientProject),
    functions: new Functions(clientProject),
    health: new Health(clientProject),
    locale: new Locale(clientProject),
    messaging: new Messaging(clientProject),
    project: new Project(clientProject),
    projectApi: new ProjectApi(clientProject),
    storage: new Storage(clientProject),
    tokens: new Tokens(clientProject),
    teams: new Teams(clientProject),
    users: new Users(clientProject),
    vcs: new Vcs(clientProject),
    proxy: new Proxy(clientProject),
    migrations: new Migrations(clientProject),
    sites: new Sites(clientProject),
    tablesDB: new TablesDB(clientProject),
    /*documentsDB: new DocumentsDB(clientProject),*/
    console: new Console(clientProject), // for suggestions API
    webhooks: new Webhooks(clientProject)
};

export const realtime = {
    forProject(
        region: string,
        channels: string | string[],
        callback: AppwriteRealtimeResponseEvent
    ) {
        const endpoint = getApiEndpoint(region);
        if (endpoint !== clientRealtime.config.endpoint) {
            clientRealtime.setEndpoint(endpoint);
        }

        // because uses a different client!
        const realtime = new Realtime(clientRealtime);

        return createRealtimeSubscription(realtime, channels, callback);
    },

    forConsole(
        region: string,
        channels: string | string[],
        callback: AppwriteRealtimeResponseEvent
    ): () => void {
        const realtimeInstance = region
            ? sdk.forConsoleIn(region).realtime
            : sdk.forConsole.realtime;

        return createRealtimeSubscription(realtimeInstance, channels, callback);
    }
};

export const sdk = {
    forConsole: createConsoleSdk(clientConsole),
    // Operator-only console client. It is intentionally not registered with the
    // impersonation module so admin actions like switching targets stay scoped
    // to the real operator session.
    forConsoleAsOperator: createConsoleSdk(clientConsoleOperator),

    forConsoleIn(region: string) {
        const regionAwareEndpoint = getApiEndpoint(region);
        if (regionAwareEndpoint !== scopedConsoleClient.config.endpoint) {
            scopedConsoleClient.setEndpoint(regionAwareEndpoint);
        }

        return createConsoleSdk(scopedConsoleClient);
    },

    forProject(region: string, projectId: string) {
        const endpoint = getApiEndpoint(region);
        if (endpoint !== clientProject.config.endpoint) {
            clientProject.setEndpoint(endpoint);
        }
        if (projectId !== clientProject.config.project) {
            clientProject.setProject(projectId);
        }

        return sdkForProject;
    }
};

export enum RuleType {
    API = 'api',
    DEPLOYMENT = 'deployment',
    REDIRECT = 'redirect'
}

export enum DeploymentResourceType {
    FUNCTION = 'function',
    SITE = 'site'
}

export enum RuleTrigger {
    DEPLOYMENT = 'deployment',
    MANUAL = 'manual'
}

export type RealtimeResponse = {
    events: string[];
    channels: string[];
    timestamp: string;
    payload: unknown;
};

export type AppwriteRealtimeResponseEvent = (response: RealtimeResponse) => void;

function createRealtimeSubscription(
    realtimeInstance: Realtime,
    channels: string | string[],
    callback: AppwriteRealtimeResponseEvent
): () => void {
    const channelsArray = Array.isArray(channels) ? channels : [channels];
    const subscriptionPromise = realtimeInstance.subscribe(channelsArray, callback);

    return () => {
        subscriptionPromise.then((sub) => sub.close());
    };
}
