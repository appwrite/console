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

    export const toggleCommandCenter = () => {
        if (get(subPanels).length > 0) {
            clearSubPanels();
        } else {
            addSubPanel(RootPanel);
        }
    };
</script>

<script lang="ts">
    import { dev } from '$app/environment';
    import { portal } from '$lib/actions/portal';
    import { last } from '$lib/helpers/array';
    import { debounce } from '$lib/helpers/debounce';
    import { getContext, setContext } from 'svelte';
    import { get, writable, type Readable } from 'svelte/store';
    import { fade } from 'svelte/transition';
    import { commandCenterKeyDownHandler, disableCommands, registerCommands } from './commands';
    import { RootPanel } from './panels';
    import { addSubPanel, clearSubPanels, subPanels } from './subPanels';
    import { addNotification } from '$lib/stores/notifications';

    let debugOverlayEnabled = false;

    $: $registerCommands([
        {
            callback: toggleCommandCenter,
            keys: ['k'],
            ctrl: true,
            forceEnable: true
        },
        {
            label: 'Toggle debug overlay',
            callback: () => {
                debugOverlayEnabled = !debugOverlayEnabled;
                addNotification({
                    title: 'Debug overlay',
                    message: debugOverlayEnabled ? 'Enabled' : 'Disabled',
                    type: 'info'
                });
            },
            keys: ['d', 'o'],
            group: 'misc',
            disabled: !dev
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

    function isInputEvent(event: KeyboardEvent) {
        return ['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName);
    }

    const handleKeydown = (e: KeyboardEvent) => {
        if (!$subPanels.length) {
            if (isInputEvent(e)) return;
            keys = [...keys, e.key].slice(-10);
            resetKeys();
        }
        $commandCenterKeyDownHandler(e);
    };
</script>

<svelte:window on:mousedown={handleBlur} on:keydown={handleKeydown} />

{#if openSubPanel}
    <div class="dialog" bind:this={dialog} transition:fade|global={{ duration: 100 }}>
        <svelte:component this={openSubPanel.component} />
    </div>
{/if}

{#if dev && debugOverlayEnabled}
    <div class="debug-keys" use:portal>
        {#each keys as key, i (i)}
            <kbd class="kbd" transition:fade={{ duration: 150 }}>
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
