import { Sandbox } from '@daytonaio/sdk';
import { daytona } from './daytona-client';
import { DaytonaNotFoundError } from '@daytonaio/sdk/src/errors/DaytonaError';
import { WriterType } from './ai/mastra/utils/runtime-context';
import { OnStepUpdateFn, WorkspaceStepId } from './ai/custom-parts/workspace-state';
import { prisma } from './prisma';

const sandboxId = 'b62d2a47-2f7c-4367-aa53-4980f3fe6627';
const baseDir = '/home/daytona/workspace';

interface File {
    path: string;
    isDir: boolean;
    content?: string;
}

const ignoredFiles = [
    'entities/User.json',
    'components.json',
    'eslint.config.js',
    'src/main.tsx',
    'src/lib/superdev.client.ts',
    'src/vite-env.d.ts',
    'src/index.html',
    'package-lock.json',
    'bun.lock',
    'src/hooks/use-mobile.tsx',
    'src/hooks/use-toast.tsx',
    'postcss.config.js',
    'tailwind.config.ts',
    'tsconfig.app.json',
    'tsconfig.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'node_modules',
    'dist'
];

const isIgnored = (filePath: string, fileName: string): boolean => {
    return ignoredFiles.some((pattern) => {
        // Check exact filename match
        if (fileName === pattern) return true;

        // Check if path ends with the pattern (for relative paths)
        if (filePath.endsWith(pattern)) return true;

        // Check if path contains the pattern (for directories like node_modules)
        if (filePath.includes(`/${pattern}/`) || filePath.includes(`/${pattern}`)) return true;

        return false;
    });
};

export const getFileContent = async ({
    sandbox,
    filePath
}: {
    sandbox: Sandbox;
    filePath: string;
}) => {
    const fileContentBuffer = await sandbox.fs.downloadFile(filePath);
    const content = fileContentBuffer.toString('utf-8');
    return content;
};

export const listFilesInDir = async ({
    sandbox,
    dirPath,
    recursive,
    withContent
}: {
    sandbox: Sandbox;
    dirPath: string;
    recursive: boolean;
    withContent: boolean;
}): Promise<File[]> => {
    const result = await sandbox.fs.listFiles(`${baseDir}/${dirPath}`);
    // Filter out ignored files first
    const filteredFiles = result.filter((file) => {
        const filePath = `${baseDir}/${dirPath}/${file.name}`;
        return !isIgnored(filePath, file.name);
    });

    // Process all files in parallel
    const filePromises = filteredFiles.map(async (file) => {
        const absolutePath = `${baseDir}/${dirPath}/${file.name}`;
        // Remove baseDir from the path to get relative path
        const relativePath = absolutePath.replace(baseDir, '').replace(/^\/+/, '');

        // If it's a directory
        if (file.isDir) {
            // If recursive, get files from subdirectory but don't include the directory itself
            if (recursive) {
                const subFiles = await listFilesInDir({
                    sandbox,
                    dirPath: `${dirPath}/${file.name}`,
                    recursive,
                    withContent
                });
                return subFiles; // Return only the files from subdirectory
            }
            return []; // Don't include directories at all
        }

        // It's a file - create the file object conditionally
        const currentFile: File = withContent
            ? {
                  path: relativePath,
                  isDir: false,
                  content: await getFileContent({ sandbox, filePath: absolutePath })
              }
            : {
                  path: relativePath,
                  isDir: false
              };

        return [currentFile];
    });

    // Wait for all promises to resolve in parallel
    const fileArrays = await Promise.all(filePromises);

    // Flatten the array of arrays
    return fileArrays.flat();
};

export const createOrUpdateFile = async ({
    sandbox,
    filePath,
    content
}: {
    sandbox: Sandbox;
    filePath: string;
    content: string;
}) => {
    const contentBuffer = Buffer.from(content, 'utf-8');
    const fullPath = `${baseDir}/${filePath}`;

    await sandbox.fs.uploadFile(contentBuffer, fullPath);

    return {
        path: filePath,
        content: contentBuffer.toString('utf-8')
    };
};

export const moveFile = async ({
    sandbox,
    filePath,
    newPath
}: {
    sandbox: Sandbox;
    filePath: string;
    newPath: string;
}) => {
    const fullPath = `${baseDir}/${filePath}`;
    const newFullPath = `${baseDir}/${newPath}`;

    await sandbox.fs.moveFiles(fullPath, newFullPath);

    return {
        message: 'File moved successfully',
        newPath: newFullPath,
        oldPath: fullPath
    };
};

export const deleteFile = async ({ sandbox, filePath }: { sandbox: Sandbox; filePath: string }) => {
    const fullPath = `${baseDir}/${filePath}`;
    await sandbox.fs.deleteFile(fullPath);

    return {
        message: 'File deleted successfully',
        path: filePath
    };
};

async function deleteOldSandboxes() {
    const deleteCount = 3;
    console.log('Deleting old sandboxes');
    const sandboxes = await daytona.list();

    // Delete oldest sandboxes
    const sandboxesToDelete: Sandbox[] = sandboxes
        .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
        .slice(0, deleteCount);

    console.log('Sandboxes to delete', sandboxesToDelete);

    for (const sandbox of sandboxesToDelete) {
        await sandbox.delete();
    }
}

const createSandbox = async ({ artifactId }: { artifactId: string }) => {
    console.log('Creating sandbox');
    let sandbox: Sandbox;
    try {
        sandbox = await daytona.create({
            snapshot: "imgn-base-vite:v2",
            labels: { artifactId },
            autoStopInterval: 10, // 10 minutes
            autoDeleteInterval: 60, // 20 minutes
            // language: 'typescript',
            public: true
        });

        return sandbox;
    } catch (e) {
        const err = e as unknown as any;

        if (err.message.includes('quota exceeded')) {
            console.log('Quota exceeded, deleting old sandboxes');
            await deleteOldSandboxes();

            try {
                sandbox = await createSandbox({
                    artifactId
                });
            } catch (e) {
                console.log('Error creating sandbox', e);
                throw e;
            }
        }

        throw e;
    }
};

export const getArtifactSandbox = async ({ artifactId }: { artifactId: string }): Promise<Sandbox | null> => {
    const sandboxes = await daytona.list({
        artifactId
    });

    const sandbox = sandboxes[0];

    if (!sandbox) {
        return null;
    }

    return sandbox;
}

export const getOrCreateArtifactSandbox = async ({
    artifactId,
    onStepUpdate
}: {
    artifactId: string;
    onStepUpdate: OnStepUpdateFn;
}): Promise<{ sandbox: Sandbox }> => {
    let sandbox: Sandbox;
    const existingSandbox = await getArtifactSandbox({ artifactId });

    if (existingSandbox) {
        onStepUpdate({
            id: WorkspaceStepId.CREATE_SANDBOX,
            status: 'in-progress',
            text: 'Getting existing workspace...'
        });

        const foundSandbox = await daytona.get(existingSandbox.id);

        if (foundSandbox.state === "stopped") {
            console.log('Sandbox is stopped, starting...');
            await foundSandbox.start();
            console.log('Sandbox started');
        }

        sandbox = foundSandbox;
    } else {
        console.log('Workspace not found, creating...');

        onStepUpdate({
            id: WorkspaceStepId.CREATE_SANDBOX,
            status: 'in-progress',
            text: 'Creating workspace...'
        });

        sandbox = await createSandbox({
            artifactId
        });

        // Save sandbox id to db
        await prisma.conversation.update({
            where: {
                id: artifactId
            },
            data: {
                sandboxId: sandbox.id
            }
        });

        const cwd = `/home/daytona/workspace`;
        console.log('Created sandbox', sandbox);
    }

    onStepUpdate({
      id: WorkspaceStepId.CREATE_SANDBOX,
      status: 'completed',
      text: 'Workspace found'
  });

    return { sandbox };
};

export async function startDevServer({
    sandbox,
    onStepUpdate
}: {
    sandbox: Sandbox;
    onStepUpdate: OnStepUpdateFn;
}) {
    onStepUpdate({
        id: WorkspaceStepId.START_DEV_SERVER,
        status: 'in-progress',
        text: 'Starting dev server...'
    });

    console.log('Exposing port 3000');
    const previewLink = await sandbox.getPreviewLink(3000);
    console.log('Preview link', { ...previewLink });

    let sessionFound = true;

    try {
        console.log('Checking for existing session');
        const existingSession = await sandbox.process.getSession('devserver');
    } catch (e) {
        console.log('Session not found, creating...');
        sessionFound = false;
    }

    if (!sessionFound) {
        console.log('Running dev server in the background');
        await sandbox.process.createSession('devserver');
        const cmd = await sandbox.process.executeSessionCommand(
            'devserver',
            {
                command: 'DEV_SERVER_PORT=3000 cd /home/daytona/workspace && bun run dev',
                runAsync: true
            },
            600
        );

        console.log('Command executed', cmd);

        if (!cmd.cmdId) {
            throw new Error('Command ID not found');
        }
    }

    onStepUpdate({
        id: WorkspaceStepId.START_DEV_SERVER,
        status: 'completed',
        text: 'Dev server started'
    });

    return {
        success: true,
        previewUrl: previewLink.url
    };
}

// async function testDaytona() {
//     const { sandbox } = await getOrCreateArtifactSandbox({
//         artifactId: '687aed2e00301cc0ea6c'
//     });

//     const { previewUrl } = await startDevServer({
//         sandbox
//     });

//     console.log('previewUrl', previewUrl);
// }

// testDaytona();
