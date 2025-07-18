import * as _path from 'path';

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
    private endpoint: string;
    private artifactBasePath: string;
    private artifactId: string;

    constructor({ endpoint, artifactId }: { endpoint: string; artifactId: string }) {
        this.endpoint = endpoint;
        this.artifactBasePath = `/usr/local/artifact`;
        this.artifactId = artifactId;
    }

    async getFolder({ path, ignoreBasePath = false }: { path: string; ignoreBasePath?: boolean }) {
        const response = await this.request({
            type: 'fs',
            operation: 'getFolder',
            params: {
                folderpath: ignoreBasePath ? path : _path.resolve(this.artifactBasePath, path)
            }
        });

        return response;
    }

    async readFile({ path }: { path: string }): Promise<{
        path: string;
        content: string;
    }> {
        const safeFilePath = _path.join(this.artifactBasePath, path);
        console.log('[readFile]', { path, safeFilePath, artifactBasePath: this.artifactBasePath });
        const response = await this.request({
            type: 'fs',
            operation: 'getFile',
            params: {
                filepath: safeFilePath
            }
        });

        return {
            path: safeFilePath,
            content: response.data.content
        };
    }

    async createFile({
        path,
        content,
        ignoreBasePath = false
    }: {
        path: string;
        content: string;
        ignoreBasePath?: boolean;
    }) {
        console.log('createFile', { path, content });
        const response = await this.request({
            type: 'fs',
            operation: 'createFile',
            params: {
                filepath: ignoreBasePath ? path : _path.resolve(this.artifactBasePath, path),
                content
            }
        });

        return response;
    }

    async createOrUpdateFile({ filepath, content }: { filepath: string; content: string }) {
        const safeFilePath = _path.join(this.artifactBasePath, filepath);
        console.log('[createOrUpdateFile]', { filepath, safeFilePath, artifactBasePath: this.artifactBasePath });
        const response = await this.request({
            type: 'fs',
            operation: 'updateFile',
            params: {
                filepath: safeFilePath,
                content
            }
        });

        return response;
    }

    async updateFilePath({ filepath, newPath }: { filepath: string; newPath: string }) {
        const safeFilePath = _path.join(this.artifactBasePath, filepath);
        const safeNewPath = _path.join(this.artifactBasePath, newPath);
        console.log('updateFilePath', { filepath: safeFilePath, newPath: safeNewPath });
        const response = await this.request({
            type: 'fs',
            operation: 'updateFilePath',
            params: {
                filepath: safeFilePath,
                newPath: safeNewPath
            }
        });

        return response;
    }

    async deleteFile({ filepath }: { filepath: string }) {
        const safeFilePath = _path.join(this.artifactBasePath, filepath);
        const response = await this.request({
            type: 'fs',
            operation: 'deleteFile',
            params: {
                filepath: safeFilePath
            }
        });

        return response;
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

        console.log("Response", response);

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
        output: string;
        exitCode: number;
    }> {
        console.log('executeCommand', { command, cwd });

        try {
            const response = await this.request({
                type: 'stateless',
                operation: 'executeCommand',
                params: {
                    command,
                    cwd,
                    timeout
                }
            });

            if (throwOnError && response.data.exitCode !== 0) {
                throw new Error(
                    `Command "${command}" failed with exit code ${response.data.exitCode}: ${response.data.output}`
                );
            }

            return {
                output: response.data.output,
                exitCode: response.data.exitCode
            };
        } catch (error) {
            console.error('Error executing command', error);
            throw error;
        }
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
        console.log('making dir path', {
            artifactBasePath: this.artifactBasePath,
            dirPath
        });
        const safeDirPath = _path.join(this.artifactBasePath, dirPath);

        console.log('safeDirPath', safeDirPath);

        const response = await this.request({
            type: 'fs',
            operation: 'listFilesInDir',
            params: {
                dirPath: safeDirPath,
                recursive,
                withContent,
                additionalIgnorePatterns
            }
        });

        console.log('Response', response);

        const data: ListFilesInDirResult[] = response.data;

        const cleanResult = data.map((file) => {
            return {
                ...file,
                path: file.path.replace(`${this.artifactBasePath}/`, '')
            };
        });

        return cleanResult;
    }

    private async request(body: Record<string, unknown>) {
        const endpoint = `${this.endpoint}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Host': `${this.artifactId}.functions.localhost`
            },
            body: JSON.stringify(body)
        });

        return response.json();
    }
}

export const createSynapseClient = ({ artifactId }: { artifactId: string }) => {
    const synapse = new SynapseHTTPClient({
        endpoint: process.env.SYNAPSE_ENDPOINT!,
        artifactId
    });

    return synapse;
};
