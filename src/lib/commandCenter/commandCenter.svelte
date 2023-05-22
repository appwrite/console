<script lang="ts" context="module">
    type Context = Readable<{
        isInitialPanel: boolean;
        open: boolean;
    }>;
    type ReadableValue<T> = T extends Readable<infer U> ? U : never;

    const contextKey = 'command-center';
    export const getCommandCenterCtx = () => getContext<Context>(contextKey);
    const setCommandCenterCtx = (value: ReadableValue<Context>) => {
        const store = writable(value);
        setContext(contextKey, store);
        return store;
    };
</script>

<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { last } from '$lib/helpers/array';
    import { getContext, setContext } from 'svelte';
    import { writable, type Readable } from 'svelte/store';
    import { fade } from 'svelte/transition';
    import { commandCenterKeyDownHandler, disableCommands, registerCommands } from './commands';
    import { Root } from './panels';
    import { addSubPanel, clearSubPanels, subPanels } from './subPanels';

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

    const ctx = setCommandCenterCtx({
        isInitialPanel: true,
        open: false
    });

    $: if (!openSubPanel) {
        $ctx.isInitialPanel = true;
    }
    $: $subPanels.length > 1 && ($ctx.isInitialPanel = false);

    $: $ctx.open = !!openSubPanel;
</script>

<svelte:window on:mousedown={handleBlur} on:keydown={$commandCenterKeyDownHandler} />

{#if openSubPanel}
    <div class="dialog" bind:this={dialog} transition:fade={{ duration: 100 }}>
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
