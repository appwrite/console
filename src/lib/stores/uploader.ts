import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

type UploaderFile = {
    $id: string;
    name: string;
    progress: number;
    completed: boolean;
    failed: boolean;
    cancelled: boolean;
    error?: string;
};
export type Uploader = {
    isOpen: boolean;
    files: UploaderFile[];
};

const createUploader = () => {
    const { subscribe, set, update } = writable<Uploader>({
        isOpen: false,
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
        toggle: () =>
            update((n) => {
                n.isOpen = !n.isOpen;

                return n;
            }),
        reset: () =>
            set({
                isOpen: false,
                files: []
            }),
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
