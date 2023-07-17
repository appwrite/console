<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { project } from '../store';
    import { showCreateBucket } from './+page.svelte';

    $: $registerCommands([
        {
            label: 'Create bucket',
            callback: () => {
                if (!$page.url.pathname.endsWith('storage')) {
                    goto(`/console/project-${$project.$id}/storage`);
                }
                $showCreateBucket = true;
            },
            keys: $page.url.pathname.endsWith('storage') ? ['c'] : ['c', 'b'],
            icon: 'plus'
        },
        {
            label: 'Go to usage',
            callback() {
                goto(`/console/project-${$project.$id}/storage/usage`);
            },
            keys: ['g', 'u'],
            disabled: $page.url.pathname.endsWith('usage'),
            group: 'storage'
        }
    ]);

    $: $updateCommandGroupRanks((prev) => ({ ...prev, storage: 10 }));
</script>

<svelte:head>
    <title>Storage - Appwrite</title>
</svelte:head>

<slot />
