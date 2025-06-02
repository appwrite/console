<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { Navbar, Sidebar } from '$lib/components';
    import type { NavbarProject } from '$lib/components/navbar.svelte';
    import { isNewWizardStatusOpen, wizard } from '$lib/stores/wizard';
    import { activeHeaderAlert } from '$routes/(console)/store';
    import { setContext } from 'svelte';
    import { writable } from 'svelte/store';
    import { showSubNavigation } from '$lib/stores/layout';
    import { organization, organizationList } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { tierToPlan } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import { hasOnboardingDismissed } from '$lib/helpers/onboarding';
    import { isSidebarOpen } from '$lib/stores/sidebar';
    import { BillingPlan } from '$lib/constants';
    import { page } from '$app/stores';
    import type { Models } from '@appwrite.io/console';

    export let showSideNavigation = false;
    export let showHeader = true;
    export let showFooter = true;
    export let loadedProjects: Array<NavbarProject> = [];
    export let selectedProject: Models.Project | null = null;

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

    let isProjectPage;
    $: isProjectPage = $page.route.id.includes('project-');

    function handleResize() {
        $isSidebarOpen = false;
        showAccountMenu = false;
    }

    const progressCard = function getProgressCard() {
        if (selectedProject && !hasOnboardingDismissed(selectedProject.$id)) {
            return {
                title: 'Get started',
                percentage: selectedProject && selectedProject.platforms.length ? 100 : 33
            };
        }

        return undefined;
    };
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
        class:icons-content={state === 'icons' && isProjectPage}
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
