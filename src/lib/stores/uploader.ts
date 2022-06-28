import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

type UploaderFile = {
    $id: string;
    bucketId: string;
    name: string;
    progress: number;
    completed: boolean;
    failed: boolean;
    cancelled: boolean;
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
        addFile: async (file: Models.File, isOpen = true, isCollapsed = false) => {
            const newFile: UploaderFile = {
                $id: file.$id,
                bucketId: file.bucketId,
                name: file.name,
                progress: calculateProgress(file),
                completed: false,
                failed: false,
                cancelled: false
            };
            return update((n) => {
                n.isOpen = isOpen;
                n.isCollapsed = isCollapsed;
                n.files.push(newFile);
                return n;
            });
        },
        removeFile: async (file: Models.File) => {
            if (file.chunksTotal === file.chunksUploaded) {
                return update((n) => {
                    n.files = n.files.filter((f) => f.$id !== file.$id);

                    return n;
                });
            } else {
                if (confirm('Are you sure you want to cancel the upload?')) {
                    updateFile(file.$id, { cancelled: true });
                }
            }
        }
    };
};

export const uploader = createUploader();

function calculateProgress(file: Models.File) {
    const progress = file.chunksUploaded / file.chunksTotal;
    return Math.round(progress * 100);
}
