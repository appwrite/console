import { goto } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { Query, type Models } from '@appwrite.io/console';
import { get } from 'svelte/store';
import type { Command, Searcher } from '../commands';
import { addSubPanel } from '../subPanels';
import { FilesPanel } from '../panels';
import { base } from '$app/paths';
import { page } from '$app/stores';

const getBucketCommand = (bucket: Models.Bucket, region: string, projectId: string) => {
    return {
        label: `${bucket.name}`,
        callback() {
            goto(`${base}/project-${region}-${projectId}/storage/bucket-${bucket.$id}`);
        },
        group: 'buckets',
        icon: 'folder'
    } satisfies Command;
};

export const bucketSearcher = (async (query: string) => {
    const $page = get(page);
    const $project = get(project);
    const region = $page.params.region;
    const { buckets } = await sdk
        .forProject($page.params.region, $page.params.project)
        .storage.listBuckets([Query.orderDesc('$createdAt')]);

    const filtered = buckets.filter((bucket) => bucket.name.includes(query));

    if (filtered.length === 1) {
        const bucket = filtered[0];
        return [
            getBucketCommand(bucket, region, $project.$id),
            {
                label: 'Find files',
                async callback() {
                    await goto(
                        `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${bucket.$id}`
                    );
                    addSubPanel(FilesPanel);
                },
                group: 'buckets',
                nested: true,
                icon: 'search',
                keepOpen: true
            },
            {
                label: 'Permissions',
                async callback() {
                    await goto(
                        `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${bucket.$id}/settings#permissions`
                    );
                    scrollBy({ top: -100 });
                },
                group: 'buckets',
                nested: true,
                icon: 'key'
            },
            {
                label: 'Extensions',
                async callback() {
                    await goto(
                        `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${bucket.$id}/settings#extensions`
                    );
                },
                group: 'buckets',
                nested: true,
                icon: 'puzzle'
            },
            {
                label: 'File Security',
                async callback() {
                    await goto(
                        `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${bucket.$id}/settings#file-security`
                    );
                    scrollBy({ top: -100 });
                },
                group: 'buckets',
                nested: true,
                icon: 'lock-closed'
            }
        ];
    }

    return filtered.map((bucket) => getBucketCommand(bucket, $project.region, $project.$id));
}) satisfies Searcher;
