import { getProjectId } from '$lib/helpers/project';
import { VARS } from '$lib/system';
import {
    Account,
    Avatars,
    Client,
    Databases,
    Functions,
    Health,
    Locale,
    // Migrations,
    Projects,
    Project,
    Storage,
    Teams,
    Users
} from '@appwrite.io/console';

const endpoint = VARS.APPWRITE_ENDPOINT ?? `${globalThis?.location?.origin}/v1`;

const clientConsole = new Client();
clientConsole.setEndpoint(endpoint).setProject('console');

const clientProject = new Client();
clientProject.setEndpoint(endpoint).setMode('admin');
const sdkForProject = {
    client: clientProject,
    account: new Account(clientProject),
    avatars: new Avatars(clientProject),
    databases: new Databases(clientProject),
    functions: new Functions(clientProject),
    health: new Health(clientProject),
    locale: new Locale(clientProject),
    project: new Project(clientProject),
    storage: new Storage(clientProject),
    teams: new Teams(clientProject),
    users: new Users(clientProject),
    // migrations: new Migrations(clientProject)
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
        // migrations: new Migrations(clientConsole)
    },
    get forProject() {
        const projectId = getProjectId();
        return getSdkForProject(projectId);
    }
};
