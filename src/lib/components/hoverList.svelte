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
    let instance: Instance;
    let currentArrow: Placement;
    let childHover = false;

    $: [arrowHorizontal, arrowPosition] = applyArrow(currentArrow);

    function applyArrow(value: Placement): [string: 'start' | 'end', string: 'top' | 'bottom'] {
        switch (value) {
            case 'bottom-start':
                return ['start', 'bottom'];
            case 'bottom-end':
                return ['end', 'bottom'];
            case 'top-start':
                return ['start', 'top'];
            case 'top-end':
                return ['end', 'top'];
            default:
                return ['start', 'bottom'];
        }
    }

    onMount(() => {
        instance = createPopper(element, tooltip, {
            placement,
            onFirstUpdate(state) {
                if (currentArrow !== state.placement) {
                    currentArrow = state.placement as Placement;
                }
            },
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, noArrow ? 0 : 12]
                    }
                },
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: ['top-start', 'top-end', 'bottom-start', 'bottom-end']
                    }
                },
                {
                    name: 'placementLogger',
                    enabled: true,
                    phase: 'main',
                    fn({ state }) {
                        if (currentArrow !== state.placement) {
                            currentArrow = state.placement as Placement;
                        }
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

    function enter() {
        show = true;
    }

    function leave() {
        setTimeout(() => {
            if (!childHover) {
                show = false;
            }
        }, 100);
    }
</script>

<svelte:window on:click={onBlur} />

<div
    on:mouseover={enter}
    on:focus={enter}
    on:mouseout={leave}
    on:blur={leave}
    class:u-cross-child-start={childStart}
    bind:this={element}>
    <slot />
    <div
        on:mouseleave={() => (childHover = false)}
        on:mouseenter={() => (childHover = true)}
        bind:this={tooltip}
        style="z-index: 10">
        {#if show}
            <div
                class="drop"
                style="position: revert"
                class:is-no-arrow={noArrow}
                class:is-arrow-start={arrowHorizontal === 'start'}
                class:is-arrow-end={arrowHorizontal === 'end'}
                class:is-block-start={arrowPosition === 'top'}
                class:is-block-end={arrowPosition === 'bottom'}>
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
</div>
