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
    import { dev } from '$app/environment';
    import { debounce } from '$lib/helpers/debounce';
    import { portal } from '$lib/actions/portal';

    $: $registerCommands([
        {
            callback: () => {
                if ($subPanels.length > 0) {
                    clearSubPanels();
                } else {
                    addSubPanel({
                        name: 'root',
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

    let keys: string[] = [];

    const resetKeys = debounce(() => {
        keys = [];
    }, 1000);

    const handleKeydown = (e) => {
        if (!$subPanels.length) {
            keys = [...keys, e.key].slice(-10);
            resetKeys();
        }
        $commandCenterKeyDownHandler(e);
    };
</script>

<svelte:window on:mousedown={handleBlur} on:keydown={handleKeydown} />

{#if openSubPanel}
    <div class="dialog" bind:this={dialog} transition:fade={{ duration: 100 }}>
        <svelte:component this={openSubPanel.component} />
    </div>
{/if}

{#if dev}
    <div class="debug-keys" use:portal>
        {#each keys as key, i (i)}
            <kbd class="kbd" transition:fade|local={{ duration: 150 }}>
                {key.length === 1 ? key.toUpperCase() : key}
            </kbd>
        {/each}
    </div>
{/if}

<style lang="scss">
    .dialog {
        padding: 0.5rem;
        position: fixed;
        inset: 0;

        background-color: hsl(var(--color-neutral-500) / 0.5);
        z-index: 9999;
    }

    .debug-keys {
        position: fixed;
        bottom: 10%;
        left: 50%;
        transform: translateX(-50%);
        padding: 0.5rem;
        // background-color: hsl(var(--color-neutral-500) / 0.5);
        z-index: 9999;

        display: flex;
        gap: 1rem;

        font-size: 2rem;

        .kbd {
            padding-inline: 0.5rem;
            padding-block: 1.5rem;
        }
    }
</style>
