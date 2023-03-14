<script lang="ts" context="module">
    export type Placement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
</script>

<script lang="ts">
    import { createPopper, type Instance } from '@popperjs/core';
    import { onDestroy, onMount } from 'svelte';

    export let show = false;
    export let noArrow = false;
    export let placement: Placement = 'bottom-start';
    export let childStart = false;
    export let noStyle = false;
    export let fullWidth = false;
    export let fixed = false;

    let element: HTMLDivElement;
    let tooltip: HTMLDivElement;
    let arrow: HTMLDivElement;
    let instance: Instance;

    onMount(() => {
        instance = createPopper(element, tooltip, {
            placement,
            strategy: fixed ? 'fixed' : 'absolute',
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
                        fallbackPlacements: ['bottom-start', 'bottom-end', 'top-start', 'top-end']
                    }
                },
                {
                    name: 'sameWidth',
                    enabled: fixed,
                    phase: 'beforeWrite',
                    requires: ['computeStyles'],
                    fn: ({ state }) => {
                        state.styles.popper.width = `${state.rects.reference.width}px`;
                    },
                    effect: ({ state }) => {
                        state.elements.popper.style.width = `${
                            (state.elements.reference as HTMLElement)?.offsetWidth
                        }px`;
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
        if (
            show &&
            !(
                event.target === element ||
                element.contains(event.target as Node) ||
                event.target === tooltip ||
                tooltip.contains(event.target as Node)
            )
        ) {
            show = false;
        }
    };
</script>

<svelte:window on:click={onBlur} />

<div class:drop-wrapper={!noStyle} class:u-cross-child-start={childStart} bind:this={element}>
    <slot />
</div>

<div
    class="drop-tooltip"
    class:u-width-full-line={fullWidth}
    bind:this={tooltip}
    style:z-index="10">
    <div class="drop-arrow" class:u-hide={!show || (show && noArrow)} bind:this={arrow} />
    {#if show}
        <slot name="list" />
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
