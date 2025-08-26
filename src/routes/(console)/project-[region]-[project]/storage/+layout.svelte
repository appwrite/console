<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { BucketsPanel } from '$lib/commandCenter/panels';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { showCreateBucket } from './+page.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    $: $registerCommands([
        {
            label: 'Create bucket',
            callback: () => {
                if (!page.url.pathname.endsWith('storage')) {
                    goto(getProjectRoute('/storage'));
                }
                $showCreateBucket = true;
            },
            keys: page.url.pathname.endsWith('storage') ? ['c'] : ['c', 'b'],
            icon: IconPlus,
            group: 'buckets',
            disabled: !$canWriteBuckets
        },
        {
            label: 'Go to usage',
            callback() {
                goto(getProjectRoute('/storage/usage'));
            },
            keys: ['g', 'u'],
            disabled: page.url.pathname.endsWith('usage') || page.url.pathname.includes('bucket-'),
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
