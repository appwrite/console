<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { disableCommands } from '$lib/commandCenter';

    export let show = false;
    export let size: 'small' | 'big' | 'huge' = null;
    export let closable = true;
    export let closeByEscape = true;
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
            trackEvent(Click.ModalCloseClick, {
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
        if (event.key === 'Escape' && closeByEscape) {
            event.preventDefault();
            trackEvent(Click.ModalCloseClick, {
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
    class:u-hide={!show}
    class:is-small={size === 'small'}
    class:is-big={size === 'big'}
    class:is-huge={size === 'huge'}
    class:is-separate-header={headerDivider}
    bind:this={dialog}
    on:cancel|preventDefault
    {style}>
    {#if show}
        <div class="content">
            <slot close={closeModal} />
        </div>
    {/if}
</dialog>

<style lang="scss">
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';

    .modal.is-huge {
        block-size: 100%;
        min-block-size: 80vh;

        @media #{devices.$break1}, #{devices.$break2} {
            min-inline-size: 100%;
            min-block-size: 100%;
            border-radius: 0;
        }
    }
</style>
