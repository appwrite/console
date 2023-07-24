<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { project } from '../store';

    $: $registerCommands([
        {
            label: 'Go to usage',
            callback: () => {
                goto(`/console/project-${$project.$id}/databases/usage`);
            },
            keys: ['g', 'u'],
            disabled:
                $page.url.pathname.includes('usage') || $page.url.pathname.includes('database-'),
            group: 'databases'
        }
    ]);

    $: $updateCommandGroupRanks((prev) => ({
        ...prev,
        databases: 100
    }));
</script>

<svelte:head>
    <title>Databases - Appwrite</title>
</svelte:head>

<slot />
