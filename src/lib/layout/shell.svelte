<script lang="ts">
    import { navigating, page } from '$app/stores';
    import { browser } from '$app/environment';
    import { wizard } from '$lib/stores/wizard';
    import { log } from '$lib/stores/logs';
    import { beforeNavigate } from '$app/navigation';

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

    beforeNavigate((n) => {
        /**
         * Hide wizard when navigation is triggered by popstate.
         */
        if (n.type === 'popstate' && $wizard.show) {
            wizard.hide();
            n.cancel();
        }
    });
</script>

<svelte:window bind:scrollY={y} />

<main
    class:grid-with-side={showSideNavigation}
    class:grid={!showSideNavigation}
    class:is-open={isOpen}
    class:u-hide={$wizard.show || $log.show}>
    <header class="main-header u-padding-inline-end-0">
        <button
            class:u-hide={!showSideNavigation}
            class="icon-button is-not-desktop"
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
        {#if $page.data?.header}
            <svelte:component this={$page.data.header} />
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
