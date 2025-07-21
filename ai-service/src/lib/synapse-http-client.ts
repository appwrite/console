import * as _path from 'path';
import * as daytonaFs from './daytona/daytona-filesystem';
import { Sandbox } from '@daytonaio/sdk';

export type ListFilesInDirResult = {
    path: string;
    content?: string;
};

export type ListFilesInDirParams = {
    dirPath: string;
    recursive?: boolean;
    withContent?: boolean;
    additionalIgnorePatterns?: string[];
};

export class SynapseHTTPClient {
    private sandbox: Sandbox;
    private endpoint: string;
    private artifactId: string;

    constructor({
        endpoint,
        artifactId,
        sandbox
    }: {
        endpoint: string;
        artifactId: string;
        sandbox: Sandbox;
    }) {
        this.endpoint = endpoint;
        this.artifactId = artifactId;
        this.sandbox = sandbox;
    }

    async readFile({ path }: { path: string }): Promise<{
        path: string;
        content: string;
    }> {
        const fileContentBuffer = await this.sandbox.fs.downloadFile(`/home/daytona/workspace/${path}`);
        const content = fileContentBuffer.toString('utf-8');

        return {
            path,
            content
        };
    }

    async createOrUpdateFile({ filepath, content }: { filepath: string; content: string }) {
        return daytonaFs.createOrUpdateFile({
            sandbox: this.sandbox,
            filePath: filepath,
            content,
        });
    }

    async updateFilePath({ filepath, newPath }: { filepath: string; newPath: string }) {
        const result = await daytonaFs.moveFile({
            filePath: filepath,
            newPath,
            sandbox: this.sandbox,
        });

        return result;
    }

    async deleteFile({ filepath }: { filepath: string }) {
        const result = await daytonaFs.deleteFile({
            sandbox: this.sandbox,
            filePath: filepath,
        });

        return result;
    }

    async startBackgroundProcess({
        command,
        args,
        cwd
    }: {
        command: string;
        args: string[];
        cwd: string;
    }): Promise<{ success: true; pid: number } | { success: false; error: string }> {
        console.log('startBackgroundProcess', { command, cwd, args });

        const response = await this.request({
            type: 'stateless',
            operation: 'startBackgroundProcess',
            params: {
                command,
                args,
                cwd
            }
        });

        console.log('Response', response);

        return response;
    }
    async executeCommand({
        command,
        cwd,
        timeout,
        throwOnError = true
    }: {
        command: string;
        cwd: string;
        timeout?: number;
        throwOnError?: boolean;
    }): Promise<{
        success: boolean;
        output: string;
        exitCode: number;
    }> {
        console.log('executeCommand', { command, cwd });

        const response = await this.sandbox.process.executeCommand(
            command,
            cwd,
            {},
            30
        );

        console.log('executeCommand response', response);

        if (response.exitCode !== 0) {
            return {
                success: false,
                output: response.result,
                exitCode: response.exitCode
            };
        }

        return {
            success: true,
            output: response.result,
            exitCode: response.exitCode
        };
    }

    async listFilesInDir({
        dirPath,
        recursive,
        withContent,
        additionalIgnorePatterns
    }: {
        dirPath: string;
        recursive?: boolean;
        withContent?: boolean;
        additionalIgnorePatterns?: string[];
    }): Promise<ListFilesInDirResult[]> {
        const files = await daytonaFs.listFilesInDir({
            sandbox: this.sandbox,
            dirPath,
            recursive: recursive || false,
            withContent: withContent || false
        });

        return files.map((file) => ({
            path: file.path,
            content: file.content
        }));
    }

    private async request(body: Record<string, unknown>) {
        const endpoint = `${this.endpoint}`;

        const host = `${this.artifactId}.${process.env.WORKSPACE_URL_DOMAIN}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Host': host
            },
            body: JSON.stringify(body)
        });

        return response.json();
    }
}

export const createSynapseClient = ({
    artifactId,
    sandbox
}: {
    artifactId: string;
    sandbox: Sandbox;
}) => {
    console.log('Creating synapse client', {
        endpoint: process.env.SYNAPSE_ENDPOINT,
        artifactId
    });
    const synapse = new SynapseHTTPClient({
        endpoint: process.env.SYNAPSE_ENDPOINT!,
        artifactId,
        sandbox
    });

    return synapse;
};
