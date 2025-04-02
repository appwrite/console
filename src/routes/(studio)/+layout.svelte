<script lang="ts">
    import { Avatar, Layout } from '@appwrite.io/pink-svelte';
    import { AvatarInitials, Breadcrumbs } from '$lib/components';
    import { page } from '$app/stores';
    import { BillingPlan } from '$lib/constants';
    import { isCloud } from '$lib/system';
    import { tierToPlan } from '$lib/stores/billing';
    import { organization, organizationList } from '$lib/stores/organization';
    import { user } from '$lib/stores/user';
    import SidebarOrganization from '$lib/components/studio/sidebarOrganization.svelte';
    import SidebarProject from '$lib/components/studio/sidebarProject.svelte';

    $: hasProjectSidebar = $page.url.pathname.startsWith('/studio/proj');

    $: loadedProjects = $page.data.projects.map((project) => {
        return {
            name: project?.name,
            $id: project.$id,
            isSelected: $page.data.currentProjectId === project.$id,
            platformCount: project.platforms.length,
            pingCount: project.pingCount
        };
    });

    $: organizations = $organizationList.teams.map((org) => {
        const billingPlan = org['billingPlan'];
        return {
            name: org.name,
            $id: org.$id,
            showUpgrade: billingPlan === BillingPlan.FREE,
            tierName: isCloud ? (tierToPlan(billingPlan)?.name ?? '') : null,
            isSelected: $page.data.currentOrganization?.$id === org.$id,
            projects: loadedProjects
        };
    });
</script>

<main>
    <Layout.Stack>
        <header>
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Breadcrumbs {organizations} />
                <AvatarInitials name={$user?.name ?? ''} size="s" />
            </Layout.Stack>
        </header>
        <div class="studio-content" class:project-sidebar={hasProjectSidebar}><slot /></div>
        {#if hasProjectSidebar}
            <SidebarProject />
        {:else}
            <SidebarOrganization organization={$page.data.currentOrganization} />
        {/if}
    </Layout.Stack>
</main>

<style lang="scss">
    main {
        min-height: 100vh;
        background-color: var(--bgcolor-neutral-default);
    }

    header {
        position: fixed;
        top: 0;
        width: 100%;
        padding: var(--space-4);
    }

    .studio-content {
        min-height: calc(100vh - 48px);
        margin-top: 48px;
        width: calc(100vw - 200px);
        margin-left: 200px;
        padding-right: var(--space-4);

        &.project-sidebar {
            width: calc(100vw - 52px);
            margin-left: 52px;
        }
    }
</style>
