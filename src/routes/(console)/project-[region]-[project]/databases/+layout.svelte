<script lang="ts">
    import { page } from '$app/state';
    import { DatabasesPanel } from '$lib/commandCenter/panels';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';

    let { children } = $props();

    $effect(() => {
        $registerCommands([
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
