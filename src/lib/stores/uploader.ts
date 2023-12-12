import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';
import { addNotification } from './notifications';
import { sdk } from './sdk';

type UploaderFile = {
    $id: string;
    bucketId: string;
    name: string;
    progress: number;
    completed: boolean;
    failed: boolean;
    error?: string;
    size: number;
};

export type Uploader = {
    isOpen: boolean;
    isCollapsed: boolean;
    files: UploaderFile[];
};

const initialState: Uploader = {
    isOpen: false,
    isCollapsed: false,
    files: []
};

const createUploader = () => {
    const { subscribe, set, update } = writable<Uploader>({ ...initialState });

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
        reset: () => set({ ...initialState }),
        updateFile: (id: string, file: Partial<UploaderFile>) => {
            update((n) => {
                const index = n.files.findIndex((f) => f.$id === id);
                n.files[index] = {
                    ...n.files[index],
                    ...file
                };

                return n;
            });
        },
        uploadFile: async function (
            bucketId: string,
            id: string,
            file: File,
            permissions: string[]
        ) {
            const newFile: UploaderFile = {
                $id: id,
                bucketId,
                name: file.name,
                progress: 0,
                completed: false,
                failed: false,
                size: file.size
            };
            update((n) => {
                n.isOpen = true;
                n.isCollapsed = false;
                n.files.unshift(newFile);
                return n;
            });
            try {
                const uploadedFile = await sdk.forProject.storage.createFile(
                    bucketId,
                    id ?? 'unique()',
                    file,
                    permissions,
                    (p) => {
                        newFile.$id = p.$id;
                        newFile.progress = p.progress;
                        newFile.completed = p.progress === 100 ? true : false;
                        this.updateFile(p.$id, newFile);
                    }
                );
                newFile.$id = uploadedFile.$id;
                newFile.progress = 100;
                newFile.completed = true;
                this.updateFile(newFile.$id, newFile);
                addNotification({
                    type: 'success',
                    message: `File has been uploaded`
                });
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                this.removeFromQueue(newFile.$id);
            }
        },
        removeFromQueue: (id: string) => {
            update((n) => {
                n.files = n.files.filter((f) => f.$id !== id);
                return n;
            });
        },
        removeFile: async function (file: Models.File) {
            if (file.chunksTotal === file.chunksUploaded) this.removeFromQueue(file.$id);
        }
    };
};

export const uploader = createUploader();
