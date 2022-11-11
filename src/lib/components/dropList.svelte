<script lang="ts">
    import { createPopper, type Instance } from '@popperjs/core';
    import { onDestroy, onMount } from 'svelte';

    export let show = false;
    export let noArrow = false;
    export let placement: Placement = 'bottom-start';
    export let scrollable = false;
    export let childStart = false;

    type Placement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
    let element: HTMLDivElement;
    let tooltip: HTMLDivElement;
    let arrow: HTMLDivElement;
    let instance: Instance;

    onMount(() => {
        instance = createPopper(element, tooltip, {
            placement,
            modifiers: [
                {
                    name: 'arrow',
                    options: {
                        element: arrow
                    }
                },
                {
                    name: 'offset',
                    options: {
                        offset: [0, noArrow ? 0 : 6]
                    }
                },
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: ['top-start', 'top-end', 'bottom-start', 'bottom-end']
                    }
                }
            ]
        });
    });

    $: if (show) {
        instance?.update();
    }

    onDestroy(() => {
        instance?.destroy();
    });

    const onBlur = (event: MouseEvent) => {
        if (show && !(event.target === element || element.contains(event.target as Node))) {
            show = false;
        }
    };
</script>

<svelte:window on:click={onBlur} />

<div class="drop-wrapper" class:u-cross-child-start={childStart} bind:this={element}>
    <slot />
</div>

<div class="drop-tooltip" bind:this={tooltip} style="z-index: 10">
    <div class="drop-arrow" class:u-hide={!show} bind:this={arrow} />
    {#if show}
        <div class="drop is-no-arrow" style="position: revert">
            <section
                class:u-overflow-y-auto={scrollable}
                class:u-max-height-200={scrollable}
                class="drop-section ">
                <ul class="drop-list">
                    <slot name="list" />
                </ul>
            </section>
            <slot name="other" />
        </div>
    {/if}
</div>

<style global lang="scss">
    .drop-tooltip[data-popper-placement^='top'] > .drop-arrow {
        bottom: -4px;
    }

    .drop-tooltip[data-popper-placement^='bottom'] > .drop-arrow {
        top: -4px;
    }

    .drop-tooltip[data-popper-placement^='left'] > .drop-arrow {
        right: -4px;
    }

    .drop-tooltip[data-popper-placement^='right'] > .drop-arrow {
        left: -4px;
    }
    .drop-arrow,
    .drop-arrow::before {
        position: absolute;
        width: 8px;
        height: 8px;
        z-index: -1;
    }

    .drop-arrow::before {
        content: '';
        transform: rotate(45deg);
        background: hsl(var(--color-neutral-200));

        body.theme-light & {
            background: hsl(var(--color-neutral-10));
        }
    }
</style>
