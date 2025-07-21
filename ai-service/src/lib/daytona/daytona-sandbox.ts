import { Sandbox } from '@daytonaio/sdk';
import { daytona } from './daytona-client';
import { OnStepUpdateFn, WorkspaceStepId } from '@/lib/ai/custom-parts/workspace-state';
import { prisma } from '@/lib/prisma';

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
            snapshot: 'imgn-base-vite:v2',
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

export const getArtifactSandbox = async ({
    artifactId
}: {
    artifactId: string;
}): Promise<Sandbox | null> => {
    const sandboxes = await daytona.list({
        artifactId
    });

    const sandbox = sandboxes[0];

    if (!sandbox) {
        return null;
    }

    return sandbox;
};

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
        const previewLink = await existingSandbox.getPreviewLink(3000);
        if (previewLink.url) {
            const result = await pingDevServer(previewLink.url);
            if (result) {
                console.log('Dev server already running');
                return {
                    sandbox: existingSandbox
                };
            }
        }

        onStepUpdate({
            id: WorkspaceStepId.CREATE_SANDBOX,
            status: 'in-progress',
            text: 'Getting existing workspace...'
        });

        const foundSandbox = await daytona.get(existingSandbox.id);

        if (foundSandbox.state === 'stopped') {
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
    // Check, maybe it's already up
    const previewLink = await sandbox.getPreviewLink(3000);
    console.log('Preview link', { ...previewLink });

    if (previewLink.url) {
        const result = await pingDevServer(previewLink.url);
        if (result) {
            console.log('Dev server already running');
            return {
                success: true,
                previewUrl: previewLink.url
            };
        }
    }

    onStepUpdate({
        id: WorkspaceStepId.START_DEV_SERVER,
        status: 'in-progress',
        text: 'Starting dev server...'
    });

    console.log('Exposing port 3000');

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

        console.log('Waiting for dev server to start');
        await waitForDevServer(previewLink.url);
        console.log('Dev server started');

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

export const pingDevServer = async (previewUrl: string) => {
    const response = await fetch(previewUrl);
    return response.status === 200;
};

export const waitForDevServer = async (previewUrl: string) => {
    // Ping preview link until getting 200
    let attempts = 0;
    let response;
    while (attempts < 10) {
        try {
            response = await fetch(previewUrl);
            if (response.status === 200) {
                break;
            }
        } catch (e) {
            // Ignore fetch errors and continue retrying
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
    }

    if (!response || response.status !== 200) {
        throw new Error('Dev server failed to start after 10 attempts');
    }

    return response;
};
