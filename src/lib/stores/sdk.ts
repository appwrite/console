import { isDev, isMultiRegionSupported, VARS } from '$lib/system';
import {
    Account,
    Assistant,
    Avatars,
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
    Realtime
} from '@appwrite.io/console';
import { Billing } from '../sdk/billing';
import { Backups } from '../sdk/backups';
import { Sources } from '$lib/sdk/sources';
import {
    REGION_FRA,
    REGION_NYC,
    REGION_SYD,
    REGION_SFO,
    REGION_SGP,
    REGION_TOR,
    SUBDOMAIN_FRA,
    SUBDOMAIN_NYC,
    SUBDOMAIN_SFO,
    SUBDOMAIN_SYD,
    SUBDOMAIN_SGP,
    SUBDOMAIN_TOR
} from '$lib/constants';
import { building } from '$app/environment';

export function getApiEndpoint(region?: string): string {
    if (building) return '';
    const url = new URL(
        VARS.APPWRITE_ENDPOINT ? VARS.APPWRITE_ENDPOINT : globalThis?.location?.toString()
    );
    const protocol = url.protocol;
    const hostname = url.host; // "hostname:port" (or just "hostname" if no port)

    // If instance supports multi-region, add the region subdomain.
    const subdomain = isMultiRegionSupported(url) ? getSubdomain(region) : '';

    return `${protocol}//${subdomain}${hostname}/v1`;
}

const getSubdomain = (region?: string) => {
    switch (region) {
        case REGION_FRA:
            return SUBDOMAIN_FRA;
        case REGION_SYD:
            return SUBDOMAIN_SYD;
        case REGION_NYC:
            return SUBDOMAIN_NYC;
        case REGION_SFO:
            return SUBDOMAIN_SFO;
        case REGION_SGP:
            return SUBDOMAIN_SGP;
        case REGION_TOR:
            return SUBDOMAIN_TOR;
        default:
            return '';
    }
};

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
        billing: new Billing(client),
        sources: new Sources(client),
        sites: new Sites(client),
        domains: new Domains(client),
        storage: new Storage(client),
        realtime: new Realtime(client)
    };
}

const endpoint = getApiEndpoint();

const clientConsole = new Client();
const scopedConsoleClient = new Client();

const clientProject = new Client();
const clientRealtime = new Client();

if (!building) {
    scopedConsoleClient.setProject('console');
    clientConsole.setEndpoint(endpoint).setProject('console');

    clientRealtime.setEndpoint(endpoint).setProject('console');
    clientProject.setEndpoint(endpoint).setMode('admin');
    clientRealtime.setEndpoint(endpoint).setProject('console');
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
    console: new Console(clientProject) // for suggestions API
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

// the generic `<T>` is too strict, any is too loose!
export type AppwriteRealtimeResponseEvent = (response: RealtimeResponse) => void;

function createRealtimeSubscription(
    realtimeInstance: Realtime,
    channels: string | string[],
    callback: AppwriteRealtimeResponseEvent
): () => void {
    let closed = false;

    const channelsArray = Array.isArray(channels) ? channels : [channels];
    const subscriptionPromise = realtimeInstance.subscribe(channelsArray, callback);

    return () => {
        if (closed) return;
        closed = true;

        subscriptionPromise
            .then((sub) => sub.close())
            .catch((error) => {
                if (isDev) {
                    console.log(error.message);
                }
            });
    };
}
