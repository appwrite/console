import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';
import { sdkForProject } from './sdk';

type UploaderFile = {
    $id: string;
    bucketId: string;
    name: string;
    progress: number;
    completed: boolean;
    failed: boolean;
    error?: string;
};
export type Uploader = {
    isOpen: boolean;
    isCollapsed: boolean;
    files: UploaderFile[];
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
        uploadFile: async (bucketId: string, id: string, file: File, permissions: string[]) => {
            const newFile: UploaderFile = {
                $id: id,
                bucketId: bucketId,
                name: file.name,
                progress: 0,
                completed: false,
                failed: false
            };
            update((n) => {
                n.isOpen = true;
                n.isCollapsed = false;
                n.files.unshift(newFile);
                return n;
            });
            const uploadedFile = await sdkForProject.storage.createFile(
                bucketId,
                id ?? 'unique()',
                file,
                permissions,
                (p) => {
                    newFile.$id = p.$id;
                    newFile.progress = p.progress;
                    newFile.completed = p.progress === 100 ? true : false;
                    updateFile(p.$id, newFile);
                }
            );
            newFile.$id = uploadedFile.$id;
            newFile.progress = 100;
            newFile.completed = true;
            updateFile(newFile.$id, newFile);
        },
        removeFromQueue: (id: string) => {
            update((n) => {
                n.files = n.files.filter((f) => f.$id !== id);
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
