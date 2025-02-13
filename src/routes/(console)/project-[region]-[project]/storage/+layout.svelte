<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { BucketsPanel } from '$lib/commandCenter/panels';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { project } from '../store';
    import { showCreateBucket } from './+page.svelte';

    $: $registerCommands([
        {
            label: 'Create bucket',
            callback: () => {
                if (!$page.url.pathname.endsWith('storage')) {
                    goto(`${base}/project-${$project.region}-${$project.$id}/storage`);
                }
                $showCreateBucket = true;
            },
            keys: $page.url.pathname.endsWith('storage') ? ['c'] : ['c', 'b'],
            icon: 'plus',
            group: 'buckets',
            disabled: !$canWriteBuckets
        },
        {
            label: 'Go to usage',
            callback() {
                goto(`${base}/project-${$project.region}-${$project.$id}/storage/usage`);
            },
            keys: ['g', 'u'],
            disabled:
                $page.url.pathname.endsWith('usage') || $page.url.pathname.includes('bucket-'),
            group: 'navigation',
            rank: 10
        },
        {
            label: 'Find buckets',
            callback: () => {
                addSubPanel(BucketsPanel);
            },
            group: 'storage',
            rank: -1
        }
    ]);

    $: $updateCommandGroupRanks({ buckets: 200, files: 150, navigation: 100 });
</script>

<svelte:head>
    <title>Storage - Appwrite</title>
</svelte:head>

<slot />
