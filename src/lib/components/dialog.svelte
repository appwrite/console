<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';

    export let show = false;
    export let size: 'small' | 'big' = null;
    export let error: string = null;
    export let closable = true;
    export let headerDivider = true;
    export let animate = true;

    let dialog: HTMLDialogElement;
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
        if (dialog && !dialog.open) {
            dialog.showModal();
            document.documentElement.classList.add('u-overflow-hidden');
        }
    }

    function closeModal() {
        if (closable) {
            if (dialog && dialog.open) {
                dispatch('close');
                dialog.close();
                show = false;
                document.documentElement.classList.remove('u-overflow-hidden');
            }
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

<dialog
    class="modal"
    class:is-small={size === 'small'}
    class:is-big={size === 'big'}
    class:is-separate-header={headerDivider}
    bind:this={dialog}
    on:cancel|preventDefault>
    {#if show}
        <slot />
    {/if}
</dialog>

<style>
    .modal {
        padding: 0.5rem;
    }
</style>
