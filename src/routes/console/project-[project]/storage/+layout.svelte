<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { BucketsPanel } from '$lib/commandCenter/panels';
    import { project } from '../store';

    $: $registerCommands([
        {
            label: 'Create bucket',
            callback: () => {
                if (!$page.url.pathname.endsWith('storage')) {
                    goto(`/console/project-${$project.$id}/storage`);
                }
            },
            keys: $page.url.pathname.endsWith('storage') ? ['c'] : ['c', 'b'],
            icon: 'plus',
            group: 'buckets'
        },
        {
            label: 'Go to usage',
            callback() {
                goto(`/console/project-${$project.$id}/storage/usage`);
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
