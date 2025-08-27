import { Client, ID, type Models, Sites, Storage } from '@appwrite.io/console';
import { writable } from 'svelte/store';
import { getApiEndpoint } from '$lib/stores/sdk';
import { page } from '$app/state';

type UploaderFile = {
    $id: string;
    resourceId: string;
    name: string;
    progress: number;
    size: number;
    status: 'failed' | 'pending' | 'success';
    error?: string;
};
export type Uploader = {
    isOpen: boolean;
    isCollapsed: boolean;
    files: UploaderFile[];
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

const createUploader = () => {
    const { subscribe, set, update } = writable<Uploader>({
        isOpen: false,
        isCollapsed: false,
        files: []
    });

    const updateFile = (id: string, file: Partial<UploaderFile>) => {
        return update((n) => {
            const index = n.files.findIndex((f) => f.$id === id);
            n.files[index] = {
                ...n.files[index],
                ...file
            };

            return n;
        });
    };

    return {
        subscribe,

        close: () =>
            update((n) => {
                n.isOpen = !n.isOpen;
                return n;
            }),
        toggle: () =>
            update((n) => {
                n.isCollapsed = !n.isCollapsed;

                return n;
            }),
        reset: () =>
            set({
                isOpen: false,
                isCollapsed: false,
                files: []
            }),
        uploadFile: async (
            region: string,
            projectId: string,
            bucketId: string,
            id: string,
            file: File,
            permissions: string[]
        ) => {
            const newFile: UploaderFile = {
                $id: id,
                resourceId: bucketId,
                name: file.name,
                size: file.size,
                progress: 0,
                status: 'pending'
            };
            update((n) => {
                n.isOpen = true;
                n.isCollapsed = false;
                n.files.unshift(newFile);
                return n;
            });
            const uploadedFile = await temporaryStorage(region, projectId).createFile({
                bucketId,
                fileId: id ?? ID.unique(),
                file,
                permissions,
                onProgress: (progress) => {
                    newFile.$id = progress.$id;
                    newFile.progress = progress.progress;
                    newFile.status = progress.progress === 100 ? 'success' : 'pending';
                    updateFile(progress.$id, newFile);
                }
            });
            newFile.$id = uploadedFile.$id;
            newFile.progress = 100;
            newFile.status = 'success';
            updateFile(newFile.$id, newFile);
        },
        uploadSiteDeployment: async (siteId: string, code: File) => {
            const newDeployment: UploaderFile = {
                $id: '',
                resourceId: siteId,
                name: code.name,
                size: code.size,
                progress: 0,
                status: 'pending'
            };
            update((n) => {
                n.isOpen = true;
                n.isCollapsed = false;
                n.files.unshift(newDeployment);
                return n;
            });
            const uploadedFile = await temporarySites(
                page.params.region,
                page.params.project
            ).createDeployment({
                siteId,
                code,
                activate: true,
                onProgress: (progress) => {
                    newDeployment.$id = progress.$id;
                    newDeployment.progress = progress.progress;
                    newDeployment.status = progress.progress === 100 ? 'success' : 'pending';
                    updateFile(progress.$id, newDeployment);
                }
            });
            newDeployment.$id = uploadedFile.$id;
            newDeployment.progress = 100;
            newDeployment.status = 'success';
            updateFile(newDeployment.$id, newDeployment);
        },
        removeFromQueue: (id: string) => {
            update((n) => {
                n.files = n.files.filter((f) => f.$id !== id);
                n.isOpen = n.files.length !== 0;
                return n;
            });
        },
        removeFile: async (file: Models.File) => {
            if (file.chunksTotal === file.chunksUploaded) {
                return update((n) => {
                    n.files = n.files.filter((f) => f.$id !== file.$id);

                    return n;
                });
            }
        }
    };
};

export const uploader = createUploader();
