import { page } from '$app/state';
import { getApiEndpoint } from '$lib/stores/sdk';
import { Client, Functions, ID, type Models, Sites, Storage } from '@appwrite.io/console';
import { writable } from 'svelte/store';

export type UploadKind = 'storage' | 'site-deployment' | 'function-deployment';
export type UploadGroupKey = 'storage' | 'deployments';

export type UploaderFile = {
    $id: string;
    clientId: string;
    resourceId: string;
    name: string;
    progress: number;
    size: number;
    status: 'failed' | 'pending' | 'success';
    kind: UploadKind;
    error?: string;
};

export type UploadGroupState = {
    isOpen: boolean;
    isVisible: boolean;
};

type UploadGroups = Record<UploadGroupKey, UploadGroupState>;

export type Uploader = {
    isOpen: boolean;
    files: UploaderFile[];
    groups: UploadGroups;
};

const temporaryStorage = (region: string, projectId: string) => {
    const clientProject = new Client().setMode('admin');
    const endpoint = getApiEndpoint(region);
    clientProject.setEndpoint(endpoint).setProject(projectId);
    return new Storage(clientProject);
};

const temporarySites = (region: string, projectId: string) => {
    const clientProject = new Client().setMode('admin');
    const endpoint = getApiEndpoint(region);
    clientProject.setEndpoint(endpoint).setProject(projectId);
    return new Sites(clientProject);
};

const temporaryFunctions = (region: string, projectId: string) => {
    const clientProject = new Client().setMode('admin');
    const endpoint = getApiEndpoint(region);
    clientProject.setEndpoint(endpoint).setProject(projectId);
    return new Functions(clientProject);
};

const MAX_CONCURRENT_UPLOADS = 5;

const createInitialGroups = (): UploadGroups => ({
    storage: {
        isOpen: true,
        isVisible: true
    },
    deployments: {
        isOpen: true,
        isVisible: true
    }
});

export function getUploadGroupKey(kind: UploadKind): UploadGroupKey {
    return kind === 'storage' ? 'storage' : 'deployments';
}

function hasFilesForGroup(files: UploaderFile[], groupKey: UploadGroupKey) {
    return files.some((file) => getUploadGroupKey(file.kind) === groupKey);
}

function refreshUploaderState(state: Uploader) {
    for (const groupKey of Object.keys(state.groups) as UploadGroupKey[]) {
        if (!hasFilesForGroup(state.files, groupKey)) {
            state.groups[groupKey] = {
                ...createInitialGroups()[groupKey]
            };
        }
    }

    state.isOpen = (Object.keys(state.groups) as UploadGroupKey[]).some(
        (groupKey) => hasFilesForGroup(state.files, groupKey) && state.groups[groupKey].isVisible
    );

    return state;
}

const createUploader = () => {
    const { subscribe, set, update } = writable<Uploader>({
        isOpen: false,
        files: [],
        groups: createInitialGroups()
    });

    const updateFile = (clientId: string, file: Partial<UploaderFile>) => {
        return update((state) => {
            const index = state.files.findIndex((item) => item.clientId === clientId);

            if (index === -1) {
                return state;
            }

            state.files[index] = {
                ...state.files[index],
                ...file
            };

            return state;
        });
    };

    const addFileToQueue = (file: UploaderFile) => {
        update((state) => {
            const groupKey = getUploadGroupKey(file.kind);

            state.files.unshift(file);
            state.groups[groupKey] = {
                isOpen: true,
                isVisible: true
            };

            return refreshUploaderState(state);
        });
    };

    const uploadFile = async (
        region: string,
        projectId: string,
        bucketId: string,
        id: string,
        file: File,
        permissions: string[]
    ) => {
        const newFile: UploaderFile = {
            $id: id,
            clientId: id,
            resourceId: bucketId,
            name: file.name,
            size: file.size,
            progress: 0,
            status: 'pending',
            kind: 'storage'
        };

        addFileToQueue(newFile);

        try {
            const uploadedFile = await temporaryStorage(region, projectId).createFile({
                bucketId,
                fileId: id ?? ID.unique(),
                file,
                permissions,
                onProgress: (progress) => {
                    newFile.$id = progress.$id;
                    newFile.progress = progress.progress;
                    newFile.status = progress.progress === 100 ? 'success' : 'pending';
                    updateFile(newFile.clientId, newFile);
                }
            });
            newFile.$id = uploadedFile.$id;
            newFile.progress = 100;
            newFile.status = 'success';
            updateFile(newFile.clientId, newFile);
        } catch (e) {
            newFile.status = 'failed';
            newFile.error = e?.message ?? 'Upload failed';
            updateFile(newFile.clientId, newFile);
            throw e;
        }
    };

    const uploadFiles = async (
        region: string,
        projectId: string,
        bucketId: string,
        files: { id: string; file: File }[],
        permissions: string[]
    ) => {
        const results: PromiseSettledResult<void>[] = [];
        const executing = new Set<Promise<void>>();

        for (const { id, file } of files) {
            const task = uploadFile(region, projectId, bucketId, id, file, permissions).then(
                () => {
                    results.push({ status: 'fulfilled', value: undefined });
                    executing.delete(task);
                },
                (reason) => {
                    results.push({ status: 'rejected', reason });
                    executing.delete(task);
                }
            );
            executing.add(task);

            if (executing.size >= MAX_CONCURRENT_UPLOADS) {
                await Promise.race(executing);
            }
        }

        await Promise.all(executing);
        return results;
    };

    const uploadDeployment = async (
        kind: Extract<UploadKind, 'site-deployment' | 'function-deployment'>,
        resourceId: string,
        name: string,
        size: number,
        request: () => Promise<Models.Deployment>
    ) => {
        const newDeployment: UploaderFile = {
            $id: '',
            clientId: ID.unique(),
            resourceId,
            name,
            size,
            progress: 0,
            status: 'pending',
            kind
        };

        addFileToQueue(newDeployment);

        try {
            const uploadedFile = await request();
            newDeployment.$id = uploadedFile.$id;
            newDeployment.progress = 100;
            newDeployment.status = 'success';
            updateFile(newDeployment.clientId, newDeployment);
        } catch (e) {
            newDeployment.status = 'failed';
            newDeployment.error = e?.message ?? 'Upload failed';
            updateFile(newDeployment.clientId, newDeployment);
            throw e;
        }
    };

    return {
        subscribe,
        reset: () =>
            set({
                isOpen: false,
                files: [],
                groups: createInitialGroups()
            }),
        uploadFile,
        uploadFiles,
        uploadSiteDeployment: async ({
            siteId,
            code,
            buildCommand,
            installCommand,
            outputDirectory
        }: {
            siteId: string;
            code: File;
            buildCommand?: string;
            installCommand?: string;
            outputDirectory?: string;
        }) => {
            return uploadDeployment('site-deployment', siteId, code.name, code.size, async () =>
                temporarySites(page.params.region, page.params.project).createDeployment({
                    siteId,
                    code,
                    activate: true,
                    buildCommand,
                    installCommand,
                    outputDirectory
                })
            );
        },
        uploadFunctionDeployment: async ({
            functionId,
            code
        }: {
            functionId: string;
            code: File;
        }) => {
            return uploadDeployment(
                'function-deployment',
                functionId,
                code.name,
                code.size,
                async () =>
                    temporaryFunctions(page.params.region, page.params.project).createDeployment({
                        functionId,
                        code,
                        activate: true
                    })
            );
        },
        toggleGroup: (groupKey: UploadGroupKey) => {
            update((state) => {
                state.groups[groupKey].isOpen = !state.groups[groupKey].isOpen;
                return refreshUploaderState(state);
            });
        },
        hideGroup: (groupKey: UploadGroupKey) => {
            update((state) => {
                state.groups[groupKey].isVisible = false;
                return refreshUploaderState(state);
            });
        },
        removeFromQueue: (id: string) => {
            update((state) => {
                state.files = state.files.filter((file) => file.$id !== id && file.clientId !== id);
                return refreshUploaderState(state);
            });
        },
        removeFile: async (file: Models.File) => {
            if (file.chunksTotal === file.chunksUploaded) {
                return update((state) => {
                    state.files = state.files.filter((item) => item.$id !== file.$id);
                    return refreshUploaderState(state);
                });
            }
        }
    };
};

export const uploader = createUploader();
