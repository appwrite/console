import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const bucket = cachedStore<
    Models.Bucket,
    {
        load: (bucketId: string) => Promise<void>;
    }
>('bucket', function ({ set }) {
    return {
        load: async (bucketId) => {
            const response = await sdkForProject.storage.getBucket(bucketId);
            set(response);
        }
    };
});

export const files = cachedStore<
    Models.FileList,
    {
        load: (
            bucketId: string,
            search?: string,
            limit?: number,
            offset?: number,
            cursor?: string,
            cursorDirection?: string
        ) => Promise<void>;
        deleteFile: (bucketId: string, fileId: string) => Promise<void>;
        addFile: (bucketId: string, file: File, read: string[], write: string[]) => Promise<void>;
        removeFile: (id: string) => Promise<void>;
    }
>('files', function ({ set, update }) {
    return {
        load: async (bucketId, search, limit, offset, cursor, cursorDirection) => {
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
        deleteFile: async (bucketId, fileId) => {
            await sdkForProject.storage.deleteFile(bucketId, fileId);
            return update((n) => {
                n.files = n.files.filter((f) => f.$id !== fileId);
                return n;
            });
        },
        addFile: async (bucketId, file, read, write) => {
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
        removeFile: async (id) => {
            return update((n) => {
                n.files = n.files.filter((f) => f.$id !== id);
                return n;
            });
        }
    };
});
