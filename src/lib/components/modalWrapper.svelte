<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import { disableCommands } from '$lib/commandCenter';

    export let show = false;
    export let size: 'small' | 'big' = null;
    export let closable = true;
    export let headerDivider = true;
    export let style = '';

    let dialog: HTMLDialogElement;

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

    $: $disableCommands(show);
</script>

<svelte:window on:mousedown={handleBLur} on:keydown={handleKeydown} />

<dialog
    class="modal"
    class:is-small={size === 'small'}
    class:is-big={size === 'big'}
    class:is-separate-header={headerDivider}
    {style}
    bind:this={dialog}
    on:cancel|preventDefault>
    {#if show}
        <slot close={closeModal} />
    {/if}
</dialog>
