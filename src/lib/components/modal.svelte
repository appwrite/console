<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade, fly, type FadeParams, type FlyParams } from 'svelte/transition';

    export let show = false;

    const dispatch = createEventDispatcher();
    const transitionFly: FlyParams = {
        duration: 150,
        y: 50
    };
    const transitionFade: FadeParams = {
        duration: 150
    };

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
        }
    };

    const handleBLur = (event: MouseEvent) => {
        const target: Partial<HTMLElement> = event.target;
        if (target.hasAttribute('data-curtain')) {
            closeModal();
        }
    };

    const closeModal = () => {
        show = false;
        dispatch('close');
    };
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
    <div class="modal-curtain" data-curtain on:click={handleBLur} transition:fade={transitionFade}>
        <section class="modal" transition:fly={transitionFly}>
            <header class="modal-header">
                <h4 class="modal-title">
                    <slot name="header" />
                </h4>
                <button
                    type="button"
                    class="x-button"
                    aria-label="Close Modal"
                    title="Close Modal"
                    on:click={closeModal}>
                    <span class="icon-x" aria-hidden="true" />
                </button>
            </header>
            <div class="modal-content">
                <slot />
            </div>
            <div class="modal-footer">
                <div class="u-flex u-main-end u-gap-12">
                    <slot name="footer" />
                </div>
            </div>
        </section>
    </div>
{/if}
