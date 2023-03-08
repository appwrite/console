import { Project } from '$lib/sdk/project';
import { VARS } from '$lib/system';
import {
    Account,
    Avatars,
    Client,
    Databases,
    Functions,
    Health,
    Locale,
    Projects,
    Storage,
    Teams,
    Users
} from '@aw-labs/appwrite-console';

const endpoint = VARS.APPWRITE_ENDPOINT ?? `${globalThis?.location?.origin}/v1`;

const clientConsole = new Client();
clientConsole.setEndpoint(endpoint).setProject('console');

export function sdkForProject() {
    const clientProject = new Client();
    clientProject.setEndpoint(endpoint).setMode('admin');

    const pathname = window.location.pathname;
    const projectMatch = pathname.match(/project-([a-zA-Z0-9]+)/);
    if (projectMatch) {
        clientProject.setProject(projectMatch[1]);
    }

    return {
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
        users: new Users(clientProject)
    };
}

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
        users: new Users(clientConsole)
    },
    get forProject() {
        const clientProject = new Client();
        clientProject.setEndpoint(endpoint).setMode('admin');

        const pathname = window.location.pathname;
        const projectMatch = pathname.match(/project-([a-zA-Z0-9]+)/);
        if (projectMatch) {
            clientProject.setProject(projectMatch[1]);
        }

        return {
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
            users: new Users(clientProject)
        };
    }
};
