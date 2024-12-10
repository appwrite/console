<script lang="ts">
    import { addSubPanel, registerCommands } from '$lib/commandCenter';
    import { FunctionsPanel } from '$lib/commandCenter/panels';
    import { canSeeFunctions } from '$lib/stores/roles';

    $registerCommands([
        {
            label: 'Find functions',
            callback: () => {
                addSubPanel(FunctionsPanel);
            },
            group: 'functions',
            rank: -1,
            disabled: !$canSeeFunctions
        }
    ]);
</script>

<svelte:head>
    <title>Functions - Appwrite</title>
</svelte:head>

<slot />
