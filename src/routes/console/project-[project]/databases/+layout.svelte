<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { DatabasesPanel } from '$lib/commandCenter/panels';
    import { project } from '../store';

    $: $registerCommands([
        {
            label: 'Find databases',
            callback: () => {
                addSubPanel(DatabasesPanel);
            },
            keys: ['f', 'd'],
            icon: 'search',
            group: 'databases',
            rank: 200
        },
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
