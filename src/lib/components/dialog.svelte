<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { createEventDispatcher } from 'svelte';
    import { fade, scale } from 'svelte/transition';

    let dialog: HTMLDivElement;

    const dispatch = createEventDispatcher();

    function handleBLur(event: MouseEvent) {
        if (event.target === dialog) {
            trackEvent('click_close_modal', {
                from: 'backdrop'
            });
            closeModal();
        }
    }

    function closeModal() {
        dispatch('close');
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            trackEvent('click_close_modal', {
                from: 'escape'
            });
            closeModal();
        }
    }
</script>

<svelte:window on:mousedown={handleBLur} on:keydown={handleKeydown} />

<div class="dialog" bind:this={dialog} transition:fade={{ duration: 150 }}>
    <div class="card" transition:scale={{ duration: 150, start: 0.9 }}>
        <slot />
    </div>
</div>

<style>
    .dialog {
        padding: 0.5rem;
        position: fixed;
        inset: 0;

        background-color: hsl(var(--color-neutral-500) / 0.5);
        z-index: 9999;
    }

    .card {
        min-width: 400px;
        padding: 0.5rem;

        position: absolute;
        top: clamp(128px, 20vh, 400px);
        left: 50%;
        translate: -50%;
    }
</style>
