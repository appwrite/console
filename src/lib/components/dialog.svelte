<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import { fade, scale } from 'svelte/transition';

    export let show = false;
    export let size: 'small' | 'big' = null;
    export let error: string = null;
    export let closable = true;
    export let headerDivider = true;
    export let animate = true;

    let dialog: HTMLDivElement;
    let alert: HTMLElement;

    const dispatch = createEventDispatcher();

    onMount(() => {
        if (show) openModal();
    });

    onDestroy(() => {
        if (show) closeModal();
    });

    function handleBLur(event: MouseEvent) {
        if (event.target === dialog) {
            trackEvent('click_close_modal', {
                from: 'backdrop'
            });
            closeModal();
        }
    }
    function openModal() {
        document.documentElement.classList.add('u-overflow-hidden');
    }

    function closeModal() {
        if (closable) {
            dispatch('close');
            show = false;
            document.documentElement.classList.remove('u-overflow-hidden');
        }
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

    $: if (show) {
        openModal();
    } else {
        closeModal();
    }

    $: if (error) {
        alert?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
</script>

<svelte:window on:mousedown={handleBLur} on:keydown={handleKeydown} />

{#if show}
    <div
        class="dialog"
        class:is-small={size === 'small'}
        class:is-big={size === 'big'}
        class:is-separate-header={headerDivider}
        on:cancel|preventDefault
        bind:this={dialog}
        transition:fade={{ duration: animate ? 150 : 0 }}>
        <div class="card" transition:scale={{ duration: animate ? 150 : 0, start: 0.9 }}>
            <slot />
        </div>
    </div>
{/if}

<style>
    .dialog {
        padding: 0.5rem;
        position: fixed;
        inset: 0;
        background-color: hsl(var(--color-neutral-500) / 0.5);
        z-index: 9999;

        display: grid;
        place-items: center;
    }

    .card {
        min-width: 400px;
        padding: 0.5rem;
    }
</style>
