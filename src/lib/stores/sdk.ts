import { getProjectId } from '$lib/helpers/project';
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
    Vcs
} from '@appwrite.io/console';
import { Billing } from '../sdk/billing';
import { Backups } from '../sdk/backups';
import { Sources } from '$lib/sdk/sources';
import { building } from '$app/environment';

export function getApiEndpoint(): string {
    if (VARS.APPWRITE_ENDPOINT) return VARS.APPWRITE_ENDPOINT;
    return globalThis?.location?.origin + '/v1';
}

const endpoint = getApiEndpoint();

const clientConsole = new Client();
const clientProject = new Client();

if (!building) {
    clientConsole.setEndpoint(endpoint).setProject('console');
    clientProject.setEndpoint(endpoint).setMode('admin');
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
    teams: new Teams(clientProject),
    users: new Users(clientProject),
    vcs: new Vcs(clientProject),
    proxy: new Proxy(clientProject),
    migrations: new Migrations(clientProject)
};

export const getSdkForProject = (projectId: string) => {
    if (projectId && projectId !== clientProject.config.project) {
        clientProject.setProject(projectId);
    }

    return sdkForProject;
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
        sources: new Sources(clientConsole)
    },
    get forProject() {
        const projectId = getProjectId();
        return getSdkForProject(projectId);
    }
};
