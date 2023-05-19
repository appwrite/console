<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { Root } from './panels';
    import { last } from '$lib/helpers/array';
    import { addSubPanel, clearSubPanels, subPanels } from './subPanels';
    import { commandCenterKeyDownHandler, disableCommands, registerCommands } from './commands';
    import { fade } from 'svelte/transition';

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

    let dialog: HTMLDivElement;

    function handleBlur(event: MouseEvent) {
        if (event.target === dialog) {
            clearSubPanels();
        }
    }

    afterNavigate(() => {
        clearSubPanels();
    });
</script>

<svelte:window on:mousedown={handleBlur} on:keydown={$commandCenterKeyDownHandler} />

{#if openSubPanel}
    <div class="dialog" bind:this={dialog} transition:fade={{ duration: 150 }}>
        <svelte:component this={openSubPanel.component} />
    </div>
{/if}

<style>
    .dialog {
        padding: 0.5rem;
        position: fixed;
        inset: 0;

        background-color: hsl(var(--color-neutral-500) / 0.5);
        z-index: 9999;
    }
</style>
