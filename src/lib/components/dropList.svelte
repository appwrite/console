<script lang="ts">
    import { slide } from 'svelte/transition';

    export let show = false;
    export let position: 'top' | 'bottom' = 'top';
    export let horizontal: 'left' | 'right' = 'right';
    export let arrowPosition: 'start' | 'center' | 'end' = 'start';
    export let arrow = true;
    let parentElement: HTMLDivElement;

    const onBlur = (event: MouseEvent) => {
        if (
            show &&
            !(event.target === parentElement || parentElement.contains(event.target as Node))
        ) {
            show = false;
        }
    };
</script>

<svelte:window on:click={onBlur} />

<div class="drop-wrapper" bind:this={parentElement}>
    <slot />
    {#if show}
        <div
            class="drop"
            class:is-arrow-center={arrowPosition === 'center'}
            class:is-arrow-end={arrowPosition === 'end'}
            class:is-no-arrow={!arrow}
            class:is-block-end={position === 'bottom'}
            class:is-inline-end={horizontal === 'left'}
            transition:slide={{ duration: 100 }}>
            <section class="drop-section">
                <ul class="drop-list">
                    <slot name="list" />
                </ul>
            </section>
            <slot name="other" />
        </div>
    {/if}
</div>
