<!-- 
    This is the template for all panels used in the command center.
    Use this component when you want to create a new panel.
 -->

<script lang="ts">
    import { getCommandCenterCtx } from '../commandCenter.svelte';

    import { clearSubPanels, popSubPanel, subPanels } from '../subPanels';

    import { quadOut } from 'svelte/easing';
    import { crossfade } from 'svelte/transition';

    type BaseOption = { callback: () => void };
    type Option = $$Generic<BaseOption>;
    export let options: Option[] | null = null;
    export let search = '';

    let selected = 0;

    function triggerOption(option: Option) {
        const prevPanels = $subPanels.length;
        option.callback();
        if (prevPanels === $subPanels.length) {
            clearSubPanels();
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (!open) return;

        if (options) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (event.metaKey) {
                    selected = options.length - 1;
                } else {
                    selected = selected === options.length - 1 ? options.length - 1 : selected + 1;
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (event.metaKey) {
                    selected = 0;
                } else {
                    selected = selected === 0 ? 0 : selected - 1;
                }
            } else if (event.key === 'Enter' && options[selected]) {
                event.preventDefault();
                triggerOption(options[selected]);
            } else if (event.key === 'Home') {
                event.preventDefault();
                selected = 0;
            } else if (event.key === 'End') {
                event.preventDefault();
                selected = options.length - 1;
            }
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            popSubPanel();
        }
    }

    $: {
        options;
        selected = 0;
    }

    const [send, receive] = crossfade({
        duration: 150,
        easing: quadOut
    });

    const commandCenterCtx = getCommandCenterCtx();
</script>

<svelte:window on:keydown={handleKeyDown} />

<div
    class="card"
    class:press={!$commandCenterCtx.isInitialPanel}
    class:scale-up={$commandCenterCtx.isInitialPanel && $commandCenterCtx.open}>
    <div class="u-flex u-flex-vertical u-width-full-line">
        <div class="u-flex">
            <slot name="search">
                <input type="text" placeholder="type here..." autofocus bind:value={search} />
            </slot>
        </div>

        {#if options}
            <ul class="u-margin-block-start-16 u-flex u-flex-vertical u-gap-8">
                {#each options as option, i}
                    <li class="result" data-selected={selected === i ? true : undefined}>
                        {#if selected === i}
                            <div
                                class="bg"
                                in:send|local={{ key: 'bg' }}
                                out:receive|local={{ key: 'bg' }} />
                        {/if}
                        <button
                            class="option"
                            on:click={() => {
                                triggerOption(option);
                            }}
                            on:mouseover={() => (selected = i)}
                            on:focus={() => (selected = i)}>
                            <slot name="option" {option} />
                        </button>
                    </li>
                {:else}
                    <li class="result">
                        <slot name="no-options">
                            <span class="text">No options found</span>
                        </slot>
                    </li>
                {/each}
            </ul>
        {:else}
            <slot />
        {/if}
    </div>
</div>

<style>
    @keyframes press {
        0% {
            scale: 1;
        }

        30% {
            scale: 0.985;
        }

        100% {
            scale: 1;
        }
    }

    .press {
        animation: press 250ms ease;
    }

    @keyframes scale-up {
        0% {
            scale: 0.95;
        }

        100% {
            scale: 1;
        }
    }

    .scale-up {
        animation: scale-up 150ms cubic-bezier(0.5, 1, 0.89, 1);
    }

    .card {
        width: var(--command-panel-width, 400px);
        max-width: 100%;
        padding: 0.5rem;

        position: absolute;
        top: clamp(128px, 15vh, 400px);
        left: 50%;
        translate: -50%;
    }

    input {
        border: none;
        background-color: transparent;
    }

    .result {
        transition: 150ms;
        position: relative;

        opacity: 0.65;
        transition: 75ms cubic-bezier(0.5, 1, 0.89, 1);
    }

    .result[data-selected] {
        opacity: 1;
        transition: 150ms cubic-bezier(0.5, 1, 0.89, 1);
    }

    .result .bg {
        position: absolute;
        inset: 0;
        background-color: hsl(var(--color-neutral-200));
        border-radius: 0.75rem;
        translate: 0 -1px;
    }

    .result .option {
        padding: 0.5rem 0.75rem;
        position: relative;
        z-index: 10;
        width: 100%;

        box-shadow: none !important;
    }
</style>
