import { Appwrite } from '../../sdk';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT.toString();
const sdkForConsole = new Appwrite();
sdkForConsole.setEndpoint(endpoint).setProject('console');

const sdkForProject = new Appwrite();
sdkForProject.setEndpoint(endpoint).setMode('admin');

const setProject = (project: string): Appwrite => sdkForProject.setProject(project);

export { sdkForConsole, sdkForProject, setProject };
