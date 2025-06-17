import { goto } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import { Query, type Models } from '@appwrite.io/console';
import type { Command, Searcher } from '../commands';
import { addSubPanel } from '../subPanels';
import { FilesPanel } from '../panels';
import {
    IconFolder,
    IconKey,
    IconLockClosed,
    IconPuzzle,
    IconSearch
} from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';
import { getProjectRoute } from '$lib/helpers/project';

const getBucketCommand = (bucket: Models.Bucket, region: string, projectId: string) => {
    return {
        label: `${bucket.name}`,
        callback: () =>
            goto(getProjectRoute({ $id: projectId, region }, `/storage/bucket-${bucket.$id}`)),
        group: 'buckets',
        icon: IconFolder
    } satisfies Command;
};

export const bucketSearcher = (async (query: string) => {
    const { buckets } = await sdk
        .forProject(page.params.region, page.params.project)
        .storage.listBuckets([Query.orderDesc('$createdAt')]);

    const filtered = buckets.filter((bucket) => bucket.name.includes(query));

    if (filtered.length === 1) {
        const bucket = filtered[0];
        return [
            getBucketCommand(bucket, page.params.region, page.params.project),
            {
                label: 'Find files',
                async callback() {
                    await goto(getProjectRoute(`/storage/bucket-${bucket.$id}`));
                    addSubPanel(FilesPanel);
                },
                group: 'buckets',
                nested: true,
                icon: IconSearch,
                keepOpen: true
            },
            {
                label: 'Permissions',
                async callback() {
                    await goto(
                        getProjectRoute(`/storage/bucket-${bucket.$id}/settings#permissions`)
                    );
                    scrollBy({ top: -100 });
                },
                group: 'buckets',
                nested: true,
                icon: IconKey
            },
            {
                label: 'Extensions',
                async callback() {
                    await goto(
                        getProjectRoute(`/storage/bucket-${bucket.$id}/settings#extensions`)
                    );
                },
                group: 'buckets',
                nested: true,
                icon: IconPuzzle
            },
            {
                label: 'File Security',
                async callback() {
                    await goto(
                        getProjectRoute(`/storage/bucket-${bucket.$id}/settings#file-security`)
                    );
                    scrollBy({ top: -100 });
                },
                group: 'buckets',
                nested: true,
                icon: IconLockClosed
            }
        ];
    }

    return filtered.map((bucket) =>
        getBucketCommand(bucket, page.params.region, page.params.project)
    );
}) satisfies Searcher;
