<script lang="ts">
    import { browser } from '$app/environment';
    import { beforeNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { log } from '$lib/stores/logs';
    import { wizard } from '$lib/stores/wizard';
    import { activeHeaderAlert } from '$routes/(console)/store';
    import { setContext } from 'svelte';
    import { writable } from 'svelte/store';

    export let isOpen = false;
    export let showSideNavigation = false;
    export let showHeader = true;
    export let showFooter = true;

    let y: number;

    page.subscribe(({ url }) => {
        isOpen = url.searchParams.get('openNavbar') === 'true';
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

    /**
     * Cancel navigation when wizard is open and triggered by popstate
     */
    beforeNavigate((n) => {
        if (n.willUnload) return;
        if (!($wizard.show || $wizard.cover)) return;
        if (n.type === 'popstate') {
            n.cancel();
        }
        if (n.type !== 'leave') {
            wizard.hide();
        }
    });

    const isNarrow = setContext('isNarrow', writable(false));
    const hasSubNavigation = setContext('hasSubNavigation', writable(false));
    $: sideSize = $hasSubNavigation ? ($isNarrow ? '17rem' : '25rem') : '12.5rem';
</script>

<svelte:window bind:scrollY={y} />

<main
    class:grid-with-side={showSideNavigation}
    class:is-open={isOpen}
    class:u-hide={$wizard.show || $log.show || $wizard.cover}
    class:is-fixed-layout={$activeHeaderAlert?.show}
    style:--p-side-size={sideSize}>
    {#if $activeHeaderAlert?.show}
        <svelte:component this={$activeHeaderAlert.component} />
    {/if}
    {#if showHeader}
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
    {/if}
    {#if showSideNavigation}
        <nav class="main-side">
            <slot name="side" />
        </nav>
    {/if}
    <section class="main-content">
        {#if $page.data?.header}
            <svelte:component this={$page.data.header} />
        {/if}

        <slot />
        {#if showFooter}
            <slot name="footer" />
        {/if}
    </section>
</main>

<style lang="scss">
    main {
        min-height: 100vh;

        &:not(.grid-with-side) {
            display: flex;
            flex-direction: column;
        }
    }

    .main-side {
        z-index: 25;
    }

    @media (max-width: 550.99px), (min-width: 551px) and (max-width: 1198.99px) {
        .main-side {
            top: 4.5rem;
        }
    }
    @media (min-width: 1199px) {
        .grid-with-side {
            grid-template-columns: auto 1fr !important;
        }
    }
</style>
