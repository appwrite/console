<script lang="ts">
    import { navigating } from '$app/stores';
    import { header } from '$lib/stores/layout';
    import { browser } from '$app/environment';
    import { wizard } from '$lib/stores/wizard';

    export let isOpen = false;
    export let showSideNavigation = false;

    let y: number;

    navigating.subscribe(() => {
        if (isOpen) isOpen = false;
    });

    const toggleMenu = () => {
        y = 0;
        isOpen = !isOpen;
        if (browser) {
            if (isOpen) {
                document.body.classList.add('u-overflow-hidden');
            } else {
                document.body.classList.remove('u-overflow-hidden');
            }
        }
    };
</script>

<svelte:window bind:scrollY={y} />

<main
    class:grid-with-side={showSideNavigation}
    class:grid={!showSideNavigation}
    class:is-open={isOpen}
    class:u-hide={$wizard.show}>
    <header class="main-header">
        <button
            class:u-hide={!showSideNavigation}
            class="icon-button is-no-desktop"
            aria-label="Open Menu"
            on:click={toggleMenu}>
            <span class:icon-x={isOpen} class:icon-menu={!isOpen} aria-hidden="true" />
        </button>
        <slot name="header" />
    </header>
    <nav class="main-side">
        <slot name="side" />
    </nav>
    <section class="main-content">
        {#if $header}
            <svelte:component this={$header} />
        {/if}

        <slot />
    </section>
</main>

<style>
    .grid-with-side {
        min-height: 100vh;
    }

    .main-side {
        z-index: 25;
    }
    @media (max-width: 550.99px), (min-width: 551px) and (max-width: 1198.99px) {
        .main-side {
            top: 4.5rem;
        }
    }
</style>
