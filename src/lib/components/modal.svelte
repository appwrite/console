<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { fade, fly, type FadeParams, type FlyParams } from 'svelte/transition';

    export let show = false;
    export let size: 'small' | 'big' = null;
    export let warning = false;
    let browser = false;
    //TODO: explore other solutions compatible with testing library
    onMount(() => {
        browser = true;
    });

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

    $: if (browser) {
        if (show) {
            document.body.classList.add('u-overflow-hidden');
        } else {
            document.body.classList.remove('u-overflow-hidden');
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
    <div class="modal-curtain" data-curtain on:click={handleBLur} transition:fade={transitionFade}>
        <section
            class:is-small={size === 'small'}
            class:is-big={size === 'big'}
            class="modal"
            transition:fly={transitionFly}>
            <header class="modal-header">
                {#if warning}
                    <div class="avatar is-color-orange is-medium">
                        <span class="icon-exclamation" aria-hidden="true" />
                    </div>
                {/if}
                <h4 class="heading-level-5">
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
