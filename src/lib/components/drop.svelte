<script lang="ts" context="module">
    export type Placement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
</script>

<script lang="ts">
    import { createPopper, type Instance } from '@popperjs/core';
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';

    export let show = false;
    export let noArrow = false;
    export let placement: Placement = 'bottom-start';
    export let childStart = false;
    export let noStyle = false;
    export let fullWidth = false;
    export let wrapperFullWidth = false;
    export let fixed = false;
    export let display = 'block';
    export let arrowSize = 10;
    export let isPopover = false;

    const dispatch = createEventDispatcher<{
        blur: undefined;
    }>();

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
                        element: arrow,
                        padding: arrowSize * 1.75
                    }
                },
                {
                    name: 'offset',
                    options: {
                        offset: [noArrow ? 0 : arrowSize * 1.75, noArrow ? 0 : arrowSize / 1.5]
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
                tooltip.contains(event.target as Node) ||
                // Avoid deleted elements triggering blur
                !document.body.contains(event.target as Node)
            )
        ) {
            show = false;
            dispatch('blur');
        }
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && show) {
            event.preventDefault();
            show = false;
            dispatch('blur');
        }
    };
</script>

<svelte:window on:click={onBlur} on:keydown={onKeyDown} />

<div
    class="u-min-width-0"
    class:drop-wrapper={!noStyle}
    class:u-cross-child-start={childStart}
    class:u-width-full-line={wrapperFullWidth}
    bind:this={element}
    style:display>
    <slot />
</div>

<div
    class="drop-tooltip"
    bind:this={tooltip}
    class:u-width-full-line={fullWidth}
    style:--arrow-size={`${arrowSize}px`}
    style:z-index="21">
    <div
        class="drop-arrow"
        class:is-popover={isPopover}
        class:u-hide={!show || (show && noArrow)}
        bind:this={arrow}>
    </div>
    {#if show}
        <slot name="list" />
    {/if}
</div>

<!-- svelte-ignore css-unused-selector -->
<style global lang="scss">
    .drop-arrow.is-popover {
        --drop-arrow-pop-over-bg-color: var(--color-neutral-90);

        body.theme-light & {
            --drop-arrow-pop-over-bg-color: var(--color-neutral-0);
        }
    }

    .drop-arrow,
    .drop-arrow::before {
        position: absolute;
        width: var(--arrow-size);
        height: var(--arrow-size);
        z-index: 1;

        --drop-arrow-border: 1px solid hsl(var(--color-neutral-85));
        --drop-arrow-bg-color: hsl(var(--drop-arrow-pop-over-bg-color, var(--color-neutral-105)));

        body.theme-light & {
            --drop-arrow-border: 1px solid hsl(var(--color-neutral-10));
            --drop-arrow-bg-color: hsl(var(--drop-arrow-pop-over-bg-color, var(--color-neutral-0)));
        }
    }

    .drop-arrow::before {
        content: '';
        transform: rotate(45deg);
        background: var(--drop-arrow-bg-color);
    }

    .drop-tooltip[data-popper-placement^='top'] > .drop-arrow {
        bottom: calc(var(--arrow-size) / -2);

        &::before {
            border-bottom: var(--drop-arrow-border);
            border-right: var(--drop-arrow-border);
            border-bottom-right-radius: 25%;
        }
    }

    .drop-tooltip[data-popper-placement^='bottom'] > .drop-arrow {
        top: calc(var(--arrow-size) / -2);

        &::before {
            border-top: var(--drop-arrow-border);
            border-left: var(--drop-arrow-border);
            border-top-left-radius: 25%;
        }
    }
</style>
