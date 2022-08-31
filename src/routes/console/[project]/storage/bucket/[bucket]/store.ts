import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createBucketStore() {
    const { subscribe, set } = writable<Models.Bucket>(
        browser ? JSON.parse(sessionStorage.getItem('bucket')) : null
    );

    return {
        subscribe,
        set,
        load: async (bucketId: string) => {
            const response = await sdkForProject.storage.getBucket(bucketId);
            set(response);
        }
    };
}

function createFilesStore() {
    const { subscribe, set, update } = writable<Models.FileList>(
        browser ? JSON.parse(sessionStorage.getItem('files')) : null
    );

    return {
        subscribe,
        set,
        load: async (
            bucketId: string,
            search?: string,
            limit?: number,
            offset?: number,
            cursor?: string,
            cursorDirection?: string
        ) => {
            const response = await sdkForProject.storage.listFiles(
                bucketId,
                search,
                limit,
                offset,
                cursor,
                cursorDirection,
                'DESC'
            );
            set(response);
        },
        deleteFile: async (bucketId: string, fileId: string) => {
            await sdkForProject.storage.deleteFile(bucketId, fileId);
            return update((n) => {
                n.files = n.files.filter((f) => f.$id !== fileId);
                return n;
            });
        },
        addFile: async (bucketId: string, file: File, read: string[], write: string[]) => {
            const newFile = {
                $id: 'tmp',
                bucketId,
                name: file.name,
                sizeOriginal: file.size,
                $createdAt: Date.now(),
                $updatedAt: Date.now(),
                $read: read,
                $write: write,
                signature: '',
                mimeType: file.type,
                chunksTotal: 100,
                chunksUploaded: 1
            };
            update((n) => {
                n.files.unshift(newFile);
                return n;
            });
        },
        removeFile: async (id: string) => {
            return update((n) => {
                n.files = n.files.filter((f) => f.$id !== id);
                return n;
            });
        }
    };
}

export const bucket = createBucketStore();
export const files = createFilesStore();

if (browser) {
    bucket.subscribe((n) => sessionStorage?.setItem('bucket', JSON.stringify(n ?? '')));
    files.subscribe((n) => sessionStorage?.setItem('files', JSON.stringify(n ?? '')));
}
