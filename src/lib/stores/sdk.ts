import { VARS } from '$lib/system';
import {
    Account,
    Assistant,
    Avatars,
    Client,
    Console,
    Databases,
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
    Tokens
} from '@appwrite.io/console';
import { Billing } from '../sdk/billing';
import { Backups } from '../sdk/backups';
import { Domains } from '$lib/sdk/domains';
import { Sources } from '$lib/sdk/sources';
import {
    REGION_FRA,
    REGION_NYC,
    REGION_SYD,
    SUBDOMAIN_FRA,
    SUBDOMAIN_NYC,
    SUBDOMAIN_SYD
} from '$lib/constants';
import { building } from '$app/environment';
import { getProjectId } from '$lib/helpers/project';

export function getApiEndpoint(region?: string): string {
    if (building) return '';
    const url = new URL(
        VARS.APPWRITE_ENDPOINT ? VARS.APPWRITE_ENDPOINT : globalThis?.location?.toString()
    );
    const protocol = url.protocol;
    const hostname = url.hostname;

    // If instance supports multi-region, add the region subdomain.
    const subdomain = VARS.APPWRITE_MULTI_REGION ? getSubdomain(region) : '';

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
        default:
            return '';
    }
};

const endpoint = getApiEndpoint();

const clientConsole = new Client();
const clientProject = new Client();
const clientRealtime = new Client();

if (!building) {
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
    databases: new Databases(clientProject),
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
    sites: new Sites(clientProject)
};

export const realtime = {
    forProject(region: string, _projectId: string) {
        const endpoint = getApiEndpoint(region);
        if (endpoint !== clientRealtime.config.endpoint) {
            clientRealtime.setEndpoint(endpoint);
        }
        return clientRealtime;
    }
};

export const sdk = {
    forConsole: {
        client: clientConsole,
        account: new Account(clientConsole),
        avatars: new Avatars(clientConsole),
        functions: new Functions(clientConsole),
        health: new Health(clientConsole),
        locale: new Locale(clientConsole),
        projects: new Projects(clientConsole),
        teams: new Teams(clientConsole),
        users: new Users(clientConsole),
        migrations: new Migrations(clientConsole),
        console: new Console(clientConsole),
        assistant: new Assistant(clientConsole),
        billing: new Billing(clientConsole),
        sources: new Sources(clientConsole),
        sites: new Sites(clientConsole),
        domains: new Domains(clientConsole)
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
    DEPLOYMENT = 'deployment',
    API = 'api',
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

export const createAdminClient = () => {
    return new Client().setEndpoint(getApiEndpoint()).setMode('admin').setProject(getProjectId());
};
