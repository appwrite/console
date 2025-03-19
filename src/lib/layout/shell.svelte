<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { Navbar, Sidebar } from '$lib/components';
    import type { NavbarProject } from '$lib/components/navbar.svelte';
    import { page } from '$app/stores';
    import { log } from '$lib/stores/logs';
    import { wizard } from '$lib/stores/wizard';
    import { activeHeaderAlert } from '$routes/(console)/store';
    import { setContext } from 'svelte';
    import { writable } from 'svelte/store';
    import { showSubNavigation } from '$lib/stores/layout';
    import { organization, organizationList } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { tierToPlan } from '$lib/stores/billing';
    import { type Models } from '@appwrite.io/console';
    import { isCloud } from '$lib/system';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import { hasOnboardingDismissed } from '$lib/helpers/onboarding';
    import { isSidebarOpen } from '$lib/stores/sidebar';
    import { BillingPlan } from '$lib/constants';

    export let showSideNavigation = false;
    export let showHeader = true;
    export let showFooter = true;
    export let loadedProjects: Array<NavbarProject> = [];
    export let projects: Array<Models.Project> = [];

    $: selectedProject = loadedProjects.find((project) => project.isSelected);
    let yOnMenuOpen: number;
    let showContentTransition = false;
    let timeoutId: ReturnType<typeof setTimeout>;

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

    const bodyStyle = writable({ position: 'static', top: '' });

    function style(node, { position, top }) {
        node.style.position = position;
        node.style.top = top;

        return {
            update: ({ position, top }) => {
                node.style.position = position;
                node.style.top = top;
            }
        };
    }

    $: {
        if ($isSidebarOpen) {
            yOnMenuOpen = window.scrollY;
            bodyStyle.set({ position: 'fixed', top: `-${window.scrollY}px` });
        } else if (!$isSidebarOpen) {
            bodyStyle.set({ position: 'static', top: '' });
            requestAnimationFrame(() => {
                window.scrollTo(0, yOnMenuOpen);
            });
        }
    }

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
    $: navbarProps = {
        logo: {
            src: 'https://appwrite.io/images/logos/logo.svg',
            alt: 'Logo Appwrite'
        },

        avatar: sdk.forConsole.avatars.getInitials($user?.name, 80, 80).toString(),

        organizations: $organizationList.teams.map((org) => {
            const billingPlan = org['billingPlan'];
            return {
                name: org.name,
                $id: org.$id,
                showUpgrade: billingPlan === BillingPlan.FREE,
                tierName: isCloud ? tierToPlan(billingPlan).name : null,
                isSelected: $organization?.$id === org.$id,
                projects: loadedProjects
            };
        })
    };

    let showAccountMenu = false;
    $: subNavigation = $page.data.subNavigation;
    let state: undefined | 'open' | 'closed' | 'icons' = 'closed';
    $: state = $isSidebarOpen ? 'open' : 'closed';

    function handleResize() {
        $isSidebarOpen = false;
        showAccountMenu = false;
    }

    $: progressCard = function getProgressCard() {
        if (selectedProject && !hasOnboardingDismissed(selectedProject.$id)) {
            const currentProject = projects.find((project) => project.$id === selectedProject.$id);

            return {
                title: 'Get started',
                percentage: currentProject && currentProject.platforms.length ? 100 : 33
            };
        }

        return undefined;
    };
</script>

<svelte:window on:resize={handleResize} />
<svelte:body use:style={$bodyStyle} />
{#if $activeHeaderAlert?.show}
    <svelte:component this={$activeHeaderAlert.component} />
{/if}
<main
    class:has-alert={$activeHeaderAlert?.show}
    class:is-open={$showSubNavigation}
    class:u-hide={$wizard.show || $log.show || $wizard.cover}
    class:is-fixed-layout={$activeHeaderAlert?.show}
    style:--p-side-size={sideSize}>
    {#if showHeader}
        <Navbar {...navbarProps} bind:sideBarIsOpen={$isSidebarOpen} bind:showAccountMenu />
    {/if}
    <Sidebar
        project={selectedProject}
        progressCard={progressCard()}
        avatar={navbarProps.avatar}
        bind:subNavigation
        bind:sideBarIsOpen={$isSidebarOpen}
        bind:showAccountMenu
        bind:state />
    <SideNavigation bind:subNavigation />
    <div
        class="content"
        class:has-transition={showContentTransition}
        class:icons-content={state === 'icons'}
        class:no-sidebar={!showSideNavigation}>
        <section class="main-content" data-test={showSideNavigation}>
            {#if $page.data?.header}
                <svelte:component this={$page.data.header} />
            {/if}
            <slot />
            {#if showFooter}
                <slot name="footer" />
            {/if}
        </section>
    </div>

    <button
        type="button"
        class:overlay={$isSidebarOpen}
        on:click={() => {
            $isSidebarOpen = false;
        }}></button>
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

    :global(main:has(.sub-navigation)) {
        .main-content {
            @media (min-width: 1024px) {
                padding-left: 255px;
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

        @media (min-width: 1024px) {
            display: none;
        }
    }
    main {
        min-height: 100vh;

        /**
            TODO: @ernst, check if this is still used. The class comes from Pink legacy
         */
        &:not(.grid-with-side) {
            display: flex;
            flex-direction: column;
        }
    }

    @media (min-width: 1199px) {
        /**
            TODO: @ernst, check if this is still used. The class comes from Pink legacy
         */
        .grid-with-side {
            outline: red 1px solid;
            grid-template-columns: auto 1fr !important;
        }
    }
    //
    //:global(main.has-alert > header) {
    //    top: 70px;
    //}
    //:global(main.has-alert > div nav) {
    //    @media (min-width: 1024px) {
    //        top: calc(48px + 70px) !important;
    //        height: calc(100vh - (48px + 70px)) !important;
    //    }
    //}
</style>
