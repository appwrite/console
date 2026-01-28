<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { DatabasesPanel } from '$lib/commandCenter/panels';
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';

    let { children } = $props();

    const databasesProjectRoute = $derived.by(() => {
        return resolveRoute('/(console)/project-[region]-[project]/databases', page.params);
    });

    $effect(() => {
        $registerCommands([
            {
                label: 'Go to usage',
                callback: () => {
                    goto(withPath(databasesProjectRoute, 'usage'));
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
    });

    $effect(() => {
        $updateCommandGroupRanks({ databases: 200, navigation: 100 });
    });
</script>

<svelte:head>
    <!-- svelte bug, the table header just stays! -->
    {#key page.url.pathname}
        <title>Databases - Appwrite</title>
    {/key}
</svelte:head>

{@render children()}
