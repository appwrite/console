<script lang="ts">
    import { afterNavigate, beforeNavigate } from '$app/navigation';
    import { Navbar, Sidebar } from '$lib/components';
    import { isNewWizardStatusOpen, wizard } from '$lib/stores/wizard';
    import { activeHeaderAlert } from '$routes/(console)/store';
    import { onMount, setContext } from 'svelte';
    import { writable } from 'svelte/store';
    import { showSubNavigation } from '$lib/stores/layout';
    import { organization, organizationList } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { tierToPlan } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import { hasOnboardingDismissed } from '$lib/helpers/onboarding';
    import { isSidebarOpen, noWidthTransition } from '$lib/stores/sidebar';
    import { BillingPlan } from '$lib/constants';
    import { page } from '$app/stores';
    import type { Models } from '@appwrite.io/console';
    import { getSidebarState, isInDatabasesRoute, updateSidebarState } from '$lib/helpers/sidebar';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { resolvedProfile } from '$lib/profiles/index.svelte';

    export let showHeader = true;
    export let showFooter = true;
    export let showSideNavigation = false;
    export let selectedProject: Models.Project = null;

    // variables
    let yOnMenuOpen: number;
    let showAccountMenu = false;
    let showContentTransition = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let state: undefined | 'open' | 'closed' | 'icons' = 'closed';

    const isNarrow = setContext('isNarrow', writable(false));
    const bodyStyle = writable({ position: 'static', top: '' });
    const hasSubNavigation = setContext('hasSubNavigation', writable(false));

    onMount(() => (state = getSidebarState()));

    // user defined functions
    function style(node: HTMLElement, { position, top }) {
        node.style.position = position;
        node.style.top = top;

        return {
            update: ({ position, top }) => {
                node.style.position = position;
                node.style.top = top;
            }
        };
    }

    function getProgressCard() {
        if (selectedProject && !hasOnboardingDismissed(selectedProject.$id, $user)) {
            const { platforms, pingCount } = selectedProject;
            let percentage = 33;

            if (platforms.length > 0 && pingCount === 0) {
                percentage = 66;
            } else if (pingCount > 0) {
                percentage = 100;
            }

            return {
                title: 'Get started',
                percentage
            };
        }

        return undefined;
    }

    function handleResize() {
        $isSidebarOpen = false;
        showAccountMenu = false;
    }

    /**
     * Cancel navigation when wizard is open and triggered by popstate
     */
    beforeNavigate((navigation) => {
        if (navigation.willUnload) return;
        if (!($wizard.show || $wizard.cover)) return;
        if (navigation.type === 'popstate') {
            navigation.cancel();
        }
        if (navigation.type !== 'leave') {
            wizard.hide();
        }

        if (!isInDatabasesRoute(navigation.from.route)) {
            updateSidebarState(state);
        } else if (isInDatabasesRoute(navigation.to.route)) {
            $noWidthTransition = true;
        }
    });

    /**
     * Maintain the sidebar state after a navigation!
     *
     * This needs to be handled like this because
     * the setup around the sidebar is very tightly configured with 2 states sync.
     *
     * The sidebar is **always closed** on mobile and tablet devices!
     */
    afterNavigate((navigation) => {
        if ($isTabletViewport) {
            state = 'closed';
            return;
        }

        const isEnteringDatabase = isInDatabasesRoute(navigation.to.route);
        const isLeavingDatabase =
            isInDatabasesRoute(navigation.from.route) && !isInDatabasesRoute(navigation.to.route);

        if (isEnteringDatabase) {
            state = 'icons';
        } else if (isLeavingDatabase) {
            state = getSidebarState();
            $noWidthTransition = false;
        }
    });

    // subscriptions
    isNewWizardStatusOpen.subscribe((value) => (showHeader = !value));

    page.subscribe(({ url }) => {
        $showSubNavigation = url.searchParams.get('openNavbar') === 'true';
        clearTimeout(timeoutId);

        if (url.pathname.includes('project-')) {
            timeoutId = setTimeout(() => {
                showContentTransition = true;
            }, 1000);
        } else {
            showContentTransition = false;
        }
    });

    // reactive blocks
    $: sideSize = $hasSubNavigation ? ($isNarrow ? '17rem' : '25rem') : '12.5rem';

    $: navbarProps = {
        logo: resolvedProfile.logo,

        avatar: sdk.forConsole.avatars
            .getInitials({
                name: $user?.name,
                width: 80,
                height: 80
            })
            .toString(),

        organizations: $organizationList.teams.map((org) => {
            const billingPlan = org['billingPlan'];
            return {
                name: org.name,
                $id: org.$id,
                showUpgrade: billingPlan === BillingPlan.FREE,
                tierName: isCloud ? tierToPlan(billingPlan).name : null,
                isSelected: $organization?.$id === org.$id
            };
        }),

        currentProject: selectedProject
    };

    $: state = $isSidebarOpen ? 'open' : 'closed';

    $: subNavigation = $page.data.subNavigation;

    $: isProjectPage = $page.route?.id?.includes('project-');

    $: {
        if ($isSidebarOpen) {
            yOnMenuOpen = window.scrollY;
            bodyStyle.set({ position: 'fixed', top: `-${window.scrollY}px` });
        } else if (!$isSidebarOpen) {
            bodyStyle.set({ position: 'static', top: '' });
            requestAnimationFrame(() => window.scrollTo(0, yOnMenuOpen));
        }
    }
</script>

<svelte:window on:resize={handleResize} />

<svelte:body use:style={$bodyStyle} />

{#if $activeHeaderAlert?.show && !$isNewWizardStatusOpen}
    <svelte:component this={$activeHeaderAlert.component} />
{/if}

<main
    class:has-alert={$activeHeaderAlert?.show}
    class:is-open={$showSubNavigation}
    class:u-hide={$wizard.show || $wizard.cover}
    class:is-fixed-layout={$activeHeaderAlert?.show}
    class:no-header={!showHeader}
    style:--p-side-size={sideSize}>
    {#if showHeader}
        <Navbar {...navbarProps} bind:sideBarIsOpen={$isSidebarOpen} bind:showAccountMenu />
    {/if}

    {#if !$isNewWizardStatusOpen && isProjectPage}
        <Sidebar
            project={selectedProject}
            progressCard={getProgressCard()}
            avatar={navbarProps.avatar}
            bind:subNavigation
            bind:sideBarIsOpen={$isSidebarOpen}
            bind:showAccountMenu
            bind:state />
    {/if}

    <SideNavigation bind:subNavigation />

    <div
        class="content"
        class:has-transition={showContentTransition}
        class:icons-content={state === 'icons' && isProjectPage}
        class:no-sidebar={!showSideNavigation}>
        <section class="main-content" data-test={showSideNavigation}>
            {#if $page.data?.header}
                <div class="layout-header">
                    <svelte:component this={$page.data.header} />
                </div>
            {/if}
            <slot />
            {#if showFooter}
                <slot name="footer" />
            {/if}
        </section>
    </div>

    {#if $isSidebarOpen}
        <button
            type="button"
            class="overlay-button"
            aria-label="Close sidebar"
            class:overlay={$isSidebarOpen}
            on:click={() => ($isSidebarOpen = false)}></button>
    {/if}
</main>

<style lang="scss">
    .content {
        width: 100%;

        margin-block-start: 48px;

        @media (min-width: 1024px) {
            width: 100%;
            padding-left: 190px;

            &.icons-content {
                padding-left: 54px;
            }
        }
    }

    .has-transition {
        @media (min-width: 1024px) {
            transition: all 0.3s ease-in-out;
        }
    }

    .no-sidebar {
        padding-left: 0;
    }

    .main-content {
        min-height: calc(100vh - 48px);
    }

    .no-header {
        min-height: 100vh;

        .content {
            margin-block-start: 0;
        }
    }

    :global(main:has(.sub-navigation)) {
        .main-content {
            @media (min-width: 1024px) {
                padding-left: 255px;
            }
        }
    }

    :global(main:has(.databases-spreadsheet)) {
        /* avoids the unnecessary sheet slide animation */
        .has-transition {
            transition: none !important;
        }

        @media (min-width: 1024px) {
            .main-content {
                height: auto;
                padding-left: 210px;
            }
        }

        @media (max-width: 768px) {
            .main-content:not(:has(.wide-screen-wrapper)) {
                width: 100%;
                position: fixed;
            }
        }
    }

    .overlay {
        position: fixed;
        width: 100vw;
        height: 100vh;
        right: 0;
        top: 0;
        z-index: 10;
        background-color: #56565c1a;
        backdrop-filter: blur(5px);
        transition:
            backdrop-filter 0.5s ease-in-out,
            background-color 0.35s ease-in-out;
    }
    .overlay-button {
        @media (min-width: 1024px) {
            display: none;
        }
    }
    main {
        min-height: calc(100vh - 48px);
    }
</style>
