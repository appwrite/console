<script lang="ts">
    import { AvatarInitials, Breadcrumbs, Chat } from '$lib/components/index.js';
    import { Avatar, Divider, Layout, Card, Typography } from '@appwrite.io/pink-svelte';
    import { page } from '$app/stores';
    import { organization, organizationList } from '$lib/stores/organization';
    import { user } from '$lib/stores/user';
    import SidebarProject from '$lib/components/studio/sidebarProject.svelte';
    import SidebarOrganization from '$lib/components/studio/sidebarOrganization.svelte';
    import { BillingPlan } from '$lib/constants.js';
    import { isCloud } from '$lib/system.js';
    import { tierToPlan } from '$lib/stores/billing.js';
    import type { NavbarProject } from '$lib/components/navbar.svelte';

    $: hasProjectSidebar = $page.url.pathname.startsWith('/studio/project');

    export let loadedProjects: Array<NavbarProject> = [];

    $: organizations = $organizationList.teams.map((org) => {
        const billingPlan = org['billingPlan'];
        return {
            name: org.name,
            $id: org.$id,
            showUpgrade: billingPlan === BillingPlan.FREE,
            tierName: isCloud ? (tierToPlan(billingPlan)?.name ?? '') : null,
            isSelected: $page.data.organization?.$id === org.$id,
            projects: loadedProjects
        };
    });

    $: showChat = !showChat ? $page.url.pathname.endsWith('builder') : showChat;
</script>

<main>
    <Layout.Stack>
        <header>
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Breadcrumbs {organizations} />
                <AvatarInitials name={$user?.name ?? ''} size="s" />
            </Layout.Stack>
        </header>
        <div class="studio-content" class:project-sidebar={hasProjectSidebar}>
            <Layout.Stack direction="row">
                {#if hasProjectSidebar}
                    <Chat bind:showChat />
                {/if}

                <Card.Base>
                    <Layout.Stack>
                        {#if $page.data?.header}
                            <svelte:component this={$page.data.header} />
                        {/if}
                        <slot />
                    </Layout.Stack>
                </Card.Base>
            </Layout.Stack>
        </div>
        {#if hasProjectSidebar}
            <SidebarProject project={$page.data.project} bind:showChat />
        {:else}
            <SidebarOrganization organization={$page.data.organization} />
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
