import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('Fetching latest @appwrite/imagine package URL...');

const response = await fetch(
    'https://pkg.vc/-/@appwrite/@imagine.dev/web-components~refs/heads/main'
);

if (!response.ok) {
    throw new Error(`Failed to fetch package URL: ${response.status} ${response.statusText}`);
}

const packageUrl = response.url;
console.log(`Package URL: ${packageUrl}`);

const command = `pnpm install ${packageUrl}`;
console.log(`Running command: ${command}`);

const { stdout, stderr } = await execAsync(command);

if (stdout) {
    console.log('stdout:', stdout);
}

if (stderr) {
    console.log('stderr:', stderr);
}

console.log('Successfully updated @appwrite/imagine package!');
