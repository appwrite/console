<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { Navbar, Sidebar } from '$lib/components';
    import { page } from '$app/stores';
    import { log } from '$lib/stores/logs';
    import { wizard } from '$lib/stores/wizard';
    import { activeHeaderAlert } from '$routes/(console)/store';
    import { onMount, setContext } from 'svelte';
    import { writable } from 'svelte/store';
    import { showSubNavigation } from '$lib/stores/layout';
    import { organization, organizationList } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { tierToPlan } from '$lib/stores/billing';
    import { type Models } from '@appwrite.io/console';

    export let showSideNavigation = false;
    export let showHeader = true;
    export let showFooter = true;
    export let loadedProjects: Array<{ name: string; $id: string; isSelected: boolean }> = [];
    export let projects: Array<Models.Project> = [];

    $: selectedProject = loadedProjects.find((project) => project.isSelected);
    let y: number;

    page.subscribe(({ url }) => {
        $showSubNavigation = url.searchParams.get('openNavbar') === 'true';
    });

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

        avatar: sdk.forConsole.avatars.getInitials($user.name, 80, 80).toString(),

        organizations: $organizationList.teams.map((org) => {
            return {
                name: org.name,
                $id: org.$id,
                tierName: tierToPlan(org.billingPlan).name,
                isSelected: $organization?.$id === org.$id,
                projects: loadedProjects
            };
        })
    };

    let sideBarIsOpen = false;
    let showAccountMenu = false;
    let state: undefined | 'open' | 'closed' | 'icons' = 'closed';
    $: state = sideBarIsOpen ? 'open' : 'closed';

    function handleResize() {
        sideBarIsOpen = false;
        showAccountMenu = false;
    }

    onMount(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    $: progressCard = function getProgressCard() {
        const currentProject = projects.find((project) => project.$id === selectedProject.$id);

        if (currentProject && currentProject.platforms.length === 0) {
            return {
                title: 'Get started',
                percentage: 33
            };
        }

        return undefined;
    };
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
    {#if showHeader}
        <Navbar {...navbarProps} bind:sideBarIsOpen bind:showSideNavigation bind:showAccountMenu />
    {/if}
    <Sidebar
        project={selectedProject}
        progressCard={progressCard()}
        avatar={navbarProps.avatar}
        bind:sideBarIsOpen
        bind:showAccountMenu
        bind:state />

    <div
        class="content"
        class:icons-content={state === 'icons'}
        class:no-sidebar={!showSideNavigation}>
        <section class="main-content">
            {#if $page.data?.header}
                <svelte:component this={$page.data.header} />
            {/if}

            <slot />
            {#if showFooter && showSideNavigation}
                <slot name="footer" />
            {/if}
        </section>
    </div>
    {#if showFooter && !showSideNavigation}
        <slot name="footer" />
    {/if}

    <button
        class:overlay={sideBarIsOpen}
        on:click={() => {
            sideBarIsOpen = false;
        }}></button>
</main>

<style lang="scss">
    .content {
        width: 100%;

        margin-top: 30px;

        @media (min-width: 1024px) {
            width: 100%;

            padding-left: 190px;
            transition: all 0.3s ease-in-out;

            &.icons-content {
                padding-left: 54px;
            }
        }
    }

    .no-sidebar {
        padding-left: 0;
    }

    .overlay {
        position: fixed;
        width: calc(100vw - 200px);
        height: 100vh;
        right: 0;
        top: 0;
        z-index: 10;
        background-color: #56565c1a;
        backdrop-filter: blur(5px);
        transition: backdrop-filter 0.5s ease-in-out;

        @media (min-width: 1024px) {
            display: none;
        }
    }
    main {
        min-height: 100vh;

        &:not(.grid-with-side) {
            display: flex;
            flex-direction: column;
        }
    }

    @media (min-width: 1199px) {
        .grid-with-side {
            grid-template-columns: auto 1fr !important;
        }
    }
</style>
