import {
    Account,
    Avatars,
    Client,
    Databases,
    Functions,
    Health,
    Locale,
    Projects,
    Project,
    Proxy,
    Storage,
    Teams,
    Users
} from '@aw-labs/appwrite-console';

const endpoint =
    import.meta.env.VITE_APPWRITE_ENDPOINT?.toString() ?? `${window?.location?.origin}/v1`;
const clientConsole = new Client();
clientConsole.setEndpoint(endpoint).setProject('console');

const clientProject = new Client();
clientProject.setEndpoint(endpoint).setMode('admin');

const setProject = (projectId: string): Client => clientProject.setProject(projectId);

const sdkForConsole = {
    client: clientConsole,
    account: new Account(clientConsole),
    avatars: new Avatars(clientConsole),
    functions: new Functions(clientConsole),
    health: new Health(clientConsole),
    locale: new Locale(clientConsole),
    projects: new Projects(clientConsole),
    teams: new Teams(clientConsole),
    users: new Users(clientConsole),
    proxy: new Proxy(clientConsole)
};

const sdkForProject = {
    client: clientProject,
    account: new Account(clientProject),
    avatars: new Avatars(clientProject),
    databases: new Databases(clientProject),
    functions: new Functions(clientProject),
    health: new Health(clientProject),
    locale: new Locale(clientProject),
    project: new Project(clientProject),
    projects: new Projects(clientProject),
    storage: new Storage(clientProject),
    teams: new Teams(clientProject),
    users: new Users(clientProject),
    proxy: new Proxy(clientProject)
};

export { sdkForConsole, sdkForProject, setProject, endpoint };
