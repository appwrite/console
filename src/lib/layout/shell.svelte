<script lang="ts">
    import { browser } from '$app/environment';
    import { beforeNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { log } from '$lib/stores/logs';
    import { wizard } from '$lib/stores/wizard';
    import { activeHeaderAlert } from '$routes/(console)/store';
    import { setContext } from 'svelte';
    import { writable } from 'svelte/store';
    import { showSubNavigation } from '$lib/stores/layout';

    export let showSideNavigation = false;

    let y: number;

    page.subscribe(({ url }) => {
        $showSubNavigation = url.searchParams.get('openNavbar') === 'true';
    });

    const toggleMenu = () => {
        y = 0;
        $showSubNavigation = !$showSubNavigation;
        if (browser) {
            if ($showSubNavigation) {
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
    class:is-open={$showSubNavigation}
    class:u-hide={$wizard.show || $log.show || $wizard.cover}
    class:is-fixed-layout={$activeHeaderAlert?.show}
    style:--p-side-size={sideSize}>
    {#if $activeHeaderAlert?.show}
        <svelte:component this={$activeHeaderAlert.component} />
    {/if}
    <header class="main-header u-padding-inline-end-0">
        <button
            class:u-hide={!showSideNavigation}
            class="icon-button is-not-desktop"
            aria-label="Open Menu"
            on:click={toggleMenu}>
            <span
                class:icon-x={$showSubNavigation}
                class:icon-menu={!$showSubNavigation}
                aria-hidden="true" />
        </button>
        <slot name="header" />
    </header>
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
        <slot name="footer" />
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
