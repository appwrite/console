import { getProjectId } from '$lib/helpers/project';
import { VARS } from '$lib/system';
import {
    Account,
    Assistant,
    Avatars,
    Backups,
    Client,
    Console,
    Databases,
    Functions,
    Health,
    Locale,
    Messaging,
    Migrations,
    Organizations,
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

export function getApiEndpoint(): string {
    if (VARS.APPWRITE_ENDPOINT) return VARS.APPWRITE_ENDPOINT;
    return globalThis?.location?.origin + '/v1';
}

const endpoint = getApiEndpoint();

const clientConsole = new Client();
clientConsole.setEndpoint(endpoint).setProject('console');

const clientProject = new Client();
clientProject.setEndpoint(endpoint).setMode('admin');

const sdkForProject = {
    account: new Account(clientProject),
    avatars: new Avatars(clientProject),
    backups: new Backups(clientProject),
    client: clientProject,
    databases: new Databases(clientProject),
    functions: new Functions(clientProject),
    health: new Health(clientProject),
    locale: new Locale(clientProject),
    messaging: new Messaging(clientProject),
    migrations: new Migrations(clientProject),
    project: new Project(clientProject),
    projectApi: new ProjectApi(clientProject),
    proxy: new Proxy(clientProject),
    storage: new Storage(clientProject),
    teams: new Teams(clientProject),
    users: new Users(clientProject),
    vcs: new Vcs(clientProject)
};

export const getSdkForProject = (projectId: string) => {
    if (projectId && projectId !== clientProject.config.project) {
        clientProject.setProject(projectId);
    }

    return sdkForProject;
};

export const sdk = {
    forConsole: {
        account: new Account(clientConsole),
        assistant: new Assistant(clientConsole),
        avatars: new Avatars(clientConsole),
        billing: new Billing(clientConsole),
        client: clientConsole,
        console: new Console(clientConsole),
        functions: new Functions(clientConsole),
        health: new Health(clientConsole),
        locale: new Locale(clientConsole),
        migrations: new Migrations(clientConsole),
        organizations: new Organizations(clientConsole),
        projects: new Projects(clientConsole),
        teams: new Teams(clientConsole),
        users: new Users(clientConsole)
    },
    get forProject() {
        const projectId = getProjectId();
        return getSdkForProject(projectId);
    }
};
