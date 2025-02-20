<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import {
        registerCommands,
        registerSearchers,
        updateCommandGroupRanks
    } from '$lib/commandCenter';
    import { fileSearcher } from '$lib/commandCenter/searchers';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { project } from '../../store';
    import { showCreateFile } from './+page.svelte';
    import { bucket } from './store';

    $: $registerCommands([
        {
            label: 'Create file',
            async callback() {
                if (!$page.url.pathname.endsWith($bucket.$id)) {
                    goto(
                        `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${$bucket.$id}`
                    );
                }
                showCreateFile();
            },
            keys: $page.url.pathname.endsWith($bucket.$id) ? ['c'] : ['c', 'f'],
            group: 'files',
            icon: 'plus'
        },
        {
            label: 'Permissions',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${$bucket.$id}/settings#permissions`
                );
                scrollBy({ top: -100 });
            },
            group: 'buckets',
            icon: 'key',
            disabled: !$canWriteBuckets
        },
        {
            label: 'Extensions',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${$bucket.$id}/settings#extensions`
                );
            },
            group: 'buckets',
            icon: 'puzzle',
            disabled: !$canWriteBuckets
        },
        {
            label: 'File security',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${$bucket.$id}/settings#file-security`
                );
                scrollBy({ top: -100 });
            },
            group: 'buckets',
            icon: 'lock-closed',
            disabled: !$canWriteBuckets
        },
        {
            label: 'Go to files',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${$bucket.$id}`
                );
            },
            disabled: $page.url.pathname.endsWith($bucket.$id),
            keys: ['g', 'f'],
            group: 'navigation',
            rank: 10
        },
        {
            label: 'Go to usage',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${$bucket.$id}/usage`
                );
            },
            disabled: $page.url.pathname.endsWith('usage'),
            keys: ['g', 'u'],
            group: 'navigation',
            rank: 10
        },
        {
            label: 'Go to settings',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/storage/bucket-${$bucket.$id}/settings`
                );
            },
            disabled: $page.url.pathname.endsWith('settings') || !$canWriteBuckets,
            keys: ['g', 's'],
            group: 'navigation',
            rank: 10
        }
    ]);

    $: $updateCommandGroupRanks({ files: 300 });

    $registerSearchers(fileSearcher);
</script>

<svelte:head>
    <title>Bucket - Appwrite</title>
</svelte:head>

<slot />
