<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { DatabasesPanel } from '$lib/commandCenter/panels';
    import { getProjectRoute } from '$lib/helpers/project';

    $: $registerCommands([
        {
            label: 'Go to usage',
            callback: () => {
                goto(getProjectRoute('/databases/usage'));
            },
            keys: ['g', 'u'],
            disabled:
                page.url.pathname.includes('usage') || page.url.pathname.includes('database-'),
            group: 'databases'
        },
        {
            label: 'Find databases',
            callback: () => {
                addSubPanel(DatabasesPanel);
            },
            group: 'databases',
            rank: -1
        }
    ]);

    $: $updateCommandGroupRanks({ databases: 200, navigation: 100 });
</script>

<svelte:head>
    <title>Databases - Appwrite</title>
</svelte:head>

<slot />
