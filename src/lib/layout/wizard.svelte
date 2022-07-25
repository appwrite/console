<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { fly, type FlyParams } from 'svelte/transition';

    export let show = false;
    export let title: string;
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

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
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
    <section class="wizard" transition:fly={transitionFly}>
        <div class="wizard-header-strip" />
        <div class="wizard-start-bg" />
        <div class="wizard-end-bg" />

        <header class="wizard-header">
            <div class="body-text-1">{title}</div>

            <slot name="header" />
            <button class="x-button" aria-label="close wizard" on:click={closeModal}>
                <span class="icon-x" aria-hidden="true" />
            </button>
        </header>

        <aside class="wizard-side">
            <slot name="aside" />
        </aside>
        <div class="wizard-main">
            <slot />
        </div>
    </section>
{/if}
