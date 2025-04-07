<script lang="ts">
    import { AvatarInitials, Breadcrumbs } from '$lib/components/index.js';
    import {
        Avatar,
        Divider,
        Layout,
        Card,
        Typography,
        Icon,
        Button
    } from '@appwrite.io/pink-svelte';
    import { page } from '$app/stores';
    import { organization, organizationList } from '$lib/stores/organization';
    import { user } from '$lib/stores/user';
    import SidebarProject from '$lib/components/studio/sidebarProject.svelte';
    import SidebarOrganization from '$lib/components/studio/sidebarOrganization.svelte';
    import { BillingPlan } from '$lib/constants.js';
    import { isCloud } from '$lib/system.js';
    import { tierToPlan } from '$lib/stores/billing.js';
    import type { NavbarProject } from '$lib/components/navbar.svelte';
    import Chat from '$lib/components/chat/chat.svelte';
    import { IconMenuAlt4 } from '@appwrite.io/pink-icons-svelte';

    $: hasProjectSidebar = $page.url.pathname.startsWith('/studio/project');

    export let loadedProjects: Array<NavbarProject> = [];
    let showSideNavigation = false;

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

    let resizer;
    let resizerLeftPosition = 500;
    let chatWidth = resizerLeftPosition - 52;
    let isResizing = false;

    function startResize(event) {
        isResizing = true;
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
        document.body.style.userSelect = 'none';
        document.getElementById('preview-iframe').style.pointerEvents = 'none';
    }

    function resize(event) {
        if (!isResizing) return;

        if (resizer) {
            resizerLeftPosition = event.clientX;
            chatWidth = event.clientX - 52;
        }
    }

    function stopResize() {
        isResizing = false;
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
        document.body.style.userSelect = '';
        document.getElementById('preview-iframe').style.pointerEvents = '';
    }
</script>

<main>
    <Layout.Stack>
        <header>
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Layout.Stack direction="row" alignItems="center" gap="none">
                    <div class="only-mobile-tablet">
                        <Button.Button
                            variant="secondary"
                            size="xs"
                            on:click={() => {
                                showSideNavigation = !showSideNavigation;
                            }}
                            ><Icon
                                icon={IconMenuAlt4}
                                color="--fgcolor-neutral-tertiary" /></Button.Button>
                    </div>
                    <Breadcrumbs {organizations} />
                </Layout.Stack>
                <AvatarInitials name={$user?.name ?? ''} size="s" />
            </Layout.Stack>
        </header>
        <div class="studio-content" class:project-sidebar={hasProjectSidebar}>
            <Layout.Stack direction="row" gap="l">
                {#if hasProjectSidebar}
                    <Chat bind:showChat width={chatWidth} />
                    {#if showChat}
                        <div
                            class="resizer"
                            style:left={`${resizerLeftPosition}px`}
                            bind:this={resizer}
                            on:mousedown={startResize}>
                        </div>
                    {/if}
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
            <SidebarOrganization
                organization={$page.data.organization}
                bind:isOpen={showSideNavigation} />
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
        z-index: 10;
        background-color: var(--bgcolor-neutral-default);
    }

    .studio-content {
        min-height: calc(100vh - 48px);
        margin-top: 48px;
        width: 100vw;

        padding-right: var(--space-4);
        padding-left: var(--space-4);

        @media (min-width: 1024px) {
            width: calc(100vw - 200px);
            margin-left: 200px;
            padding-left: 0;
        }

        &.project-sidebar {
            width: calc(100vw - 52px);

            @media (min-width: 1024px) {
                margin-left: 52px;
            }
        }
    }

    .resizer {
        width: 7px;
        margin-inline: 10px;
        position: absolute;
        height: calc(100vh - 82px);
        margin-block-start: 6px;
        cursor: col-resize;
        margin-inline-start: 8px;

        &::before {
            content: '';
            position: absolute;
            height: 100%;
            width: 1px;
            background-color: var(--border-neutral);
        }

        &::after {
            content: '';
            position: absolute;
            height: 100%;
            width: 2px;
            margin-left: -1px;
            background-color: var(--border-neutral-strong);
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }

        &:hover::after {
            opacity: 1;
        }
    }

    @media (min-width: 1024px) {
        .only-mobile-tablet {
            display: none;
        }
    }
</style>
