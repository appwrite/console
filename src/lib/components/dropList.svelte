<script lang="ts">
    export let show = false;
    export let position: 'top' | 'bottom' = 'top';
    export let horizontal: 'left' | 'right' = 'right';
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
            class:is-no-arrow={!arrow}
            class:is-block-end={position === 'bottom'}
            class:is-inline-end={horizontal === 'left'}>
            <section class="drop-section">
                <ul class="drop-list">
                    <slot name="list" />
                </ul>
            </section>
        </div>
    {/if}
</div>
