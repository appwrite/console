<!-- 
    This is the template for all panels used in the command center.
    Use this component when you want to create a new panel.
 -->

<script lang="ts">
    import { popSubPanel, subPanels } from '../subPanels';

    import Dialog from '$lib/components/dialog.svelte';
    import { quadOut } from 'svelte/easing';
    import { crossfade } from 'svelte/transition';

    type BaseOption = { callback: () => void };
    type Option = $$Generic<BaseOption>;
    export let options: Option[] | null = null;
    export let search = '';

    let selected = 0;

    function handleKeyDown(event: KeyboardEvent) {
        if (!open) return;
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
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (options[selected]) {
                options[selected].callback();
            }
        } else if (event.key === 'Home') {
            event.preventDefault();
            selected = 0;
        } else if (event.key === 'End') {
            event.preventDefault();
            selected = options.length - 1;
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
</script>

<svelte:window on:keydown={handleKeyDown} />

<Dialog on:close={popSubPanel}>
    <div class="u-flex u-flex-vertical u-width-full-line">
        {#if $subPanels.length}
            aaa
        {/if}
        <input type="text" placeholder="type here..." autofocus bind:value={search} />

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
                        <div class="option">
                            <slot name="option" {option} />
                        </div>
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
</Dialog>

<style>
    input {
        border: none;
        background-color: transparent;
    }

    .result {
        padding: 0.5rem 0.75rem;
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
        position: relative;
        z-index: 10;
    }
</style>
