import { Appwrite } from '../../sdk';

const sdkForConsole = new Appwrite();
sdkForConsole.setEndpoint('http://appwrite.test/v1').setProject('console');

const sdkForProject = new Appwrite();
sdkForProject.setEndpoint('http://appwrite.test/v1').setMode('admin');

const setProject = (project: string): Appwrite => sdkForProject.setProject(project);

export { sdkForConsole, sdkForProject, setProject };
