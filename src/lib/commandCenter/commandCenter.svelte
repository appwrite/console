<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { Root } from './panels';
    import { last } from '$lib/helpers/array';
    import { addSubPanel, clearSubPanels, subPanels } from './subPanels';
    import { commandCenterKeyDownHandler, disableCommands, registerCommands } from './commands';

    $: $registerCommands([
        {
            callback: () => {
                if ($subPanels.length > 0) {
                    clearSubPanels();
                } else {
                    addSubPanel({
                        name: 'commandPanel',
                        component: Root
                    });
                }
            },
            keys: ['k'],
            ctrl: true,
            forceEnable: true
        }
    ]);

    $: openSubPanel = last($subPanels) ?? null;
    $: $disableCommands(!!openSubPanel);

    $: if (openSubPanel) {
        document.documentElement.classList.add('u-overflow-hidden');
    } else {
        document.documentElement.classList.remove('u-overflow-hidden');
    }

    afterNavigate(() => {
        clearSubPanels();
    });
</script>

<svelte:window on:keydown={$commandCenterKeyDownHandler} />

{#if openSubPanel}
    <svelte:component this={openSubPanel.component} />
{/if}
