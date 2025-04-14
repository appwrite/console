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
    import { page } from '$app/state';
    import { organizationList } from '$lib/stores/organization';
    import { user } from '$lib/stores/user';
    import SidebarProject from '$lib/components/studio/sidebarProject.svelte';
    import SidebarOrganization from '$lib/components/studio/sidebarOrganization.svelte';
    import { BillingPlan } from '$lib/constants.js';
    import { isCloud } from '$lib/system.js';
    import { tierToPlan } from '$lib/stores/billing.js';
    import type { NavbarProject } from '$lib/components/navbar.svelte';
    import Chat from '$lib/components/chat/chat.svelte';
    import { IconMenuAlt4 } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';
    import { isTabletViewport, isSmallViewport } from '$lib/stores/viewport';
    import { derived, writable } from 'svelte/store';

    let hasProjectSidebar = $state(false);

    $effect(() => {
        hasProjectSidebar = page.url.pathname.startsWith(base + '/project');
    });

    type Props = {
        loadedProjects: Array<NavbarProject>;
    };

    let { loadedProjects = [] }: Props = $props();

    let showSideNavigation = $state(false);

    $effect(() => {
        showSideNavigation = !($isTabletViewport || $isSmallViewport);
    });

    let organizations = $state([]);
    $effect(() => {
        organizations = $organizationList.teams.map((org) => {
            const billingPlan = org['billingPlan'];
            return {
                name: org.name,
                $id: org.$id,
                showUpgrade: billingPlan === BillingPlan.FREE,
                tierName: isCloud ? (tierToPlan(billingPlan)?.name ?? '') : null,
                isSelected: page.data?.organization?.$id === org.$id,
                projects: loadedProjects
            };
        });
    });
    let showChat = $state(false);

    $effect(() => {
        if ($isSmallViewport || page.url.pathname.endsWith('studio')) {
            showChat = true;
        }
    });

    let resizer = $state(null);
    let resizerLeftPosition = $state(page.data?.subNavigation ? 524 : 500);
    let resizerLeftOffset = $state(page.data?.subNavigation ? 52 : 52);
    let chatWidth = $state(resizerLeftPosition - resizerLeftOffset);

    $effect(() => {
        chatWidth = resizerLeftPosition - resizerLeftOffset;
    });

    let isResizing = false;

    function startResize(event) {
        isResizing = true;
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
        window.addEventListener('touchmove', resize);
        window.addEventListener('touchend', stopResize);
        document.body.style.userSelect = 'none';
        document.getElementById('preview-iframe').style.pointerEvents = 'none';
    }

    function resize(event) {
        if (!isResizing) return;
        if (resizer) {
            resizerLeftPosition = (event.touches ? event.touches[0].clientX : event.clientX) - 10;
            const maxSize = page.data?.subNavigation
                ? window.innerWidth - 660
                : window.innerWidth - 460;

            const minSize = 320;

            if (resizerLeftPosition > maxSize) {
                resizerLeftPosition = maxSize;
            } else if (resizerLeftPosition < minSize) {
                resizerLeftPosition = minSize;
            }
        }
    }

    function stopResize() {
        isResizing = false;
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
        window.removeEventListener('touchmove', resize);
        window.removeEventListener('touchend', stopResize);
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
        <div
            class="studio-content"
            class:project-sidebar={hasProjectSidebar}
            class:sub-navigation={page.data.subNavigation}>
            {#if $isSmallViewport}
                {#if hasProjectSidebar}
                    <Chat
                        bind:showChat
                        width={chatWidth}
                        hasSubNavigation={page.data?.subNavigation} />
                {/if}
                <Card.Base>
                    <Layout.Stack>
                        {#if page.data?.subNavigation}
                            <svelte:component this={page.data.subNavigation} />
                        {/if}
                        <slot />
                    </Layout.Stack>
                </Card.Base>
            {:else}
                <Layout.Stack direction="row" gap="l">
                    {#if hasProjectSidebar}
                        <Chat bind:showChat width={chatWidth} hasSubNavigation={false} />
                        {#if showChat}
                            <div
                                class="resizer"
                                style:left={`${resizerLeftPosition}px`}
                                bind:this={resizer}
                                onmousedown={startResize}
                                ontouchmove={startResize}>
                            </div>
                        {/if}
                    {/if}

                    <Card.Base>
                        {#if page.data.subNavigation}
                            <svelte:component this={page.data.subNavigation} />
                            <div style:padding-left="200px" style:min-height="calc(100vh - 98px)">
                                <Layout.Stack>
                                    {#if page.data?.header}
                                        <svelte:component this={page.data.header} />
                                    {/if}
                                    <slot />
                                </Layout.Stack>
                            </div>
                        {:else}
                            <Layout.Stack>
                                {#if page.data?.header}
                                    <svelte:component this={page.data.header} />
                                {/if}
                                <slot />
                            </Layout.Stack>
                        {/if}
                    </Card.Base>
                </Layout.Stack>
            {/if}
        </div>
        {#if hasProjectSidebar}
            {#if page.data.project}
                <SidebarProject
                    project={page.data.project}
                    bind:showChat
                    bind:isOpen={showSideNavigation} />
            {/if}
        {:else}
            <SidebarOrganization
                organization={page.data.organization}
                bind:isOpen={showSideNavigation} />
        {/if}
    </Layout.Stack>
</main>
<button
    type="button"
    class="overlay-button"
    aria-label="Close sidebar"
    class:overlay={showSideNavigation}
    onclick={() => {
        showSideNavigation = false;
    }}></button>

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
            @media (min-width: 1024px) {
                width: calc(100vw - 52px);
                margin-left: 52px;
            }
        }
    }

    .resizer {
        width: 8px;
        cursor: col-resize;
        margin-inline: 10px;
        position: absolute;
        height: calc(100vh - 82px);
        margin-block-start: 6px;

        margin-inline-start: 8px;

        &::before {
            content: '';
            cursor: col-resize;
            position: absolute;
            height: 100%;
            width: 1px;
            background-color: var(--border-neutral);
        }

        &::after {
            content: '';
            cursor: col-resize;
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

    .overlay {
        background-color: rgba(0, 0, 0, 0.4);
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background-color: #56565c1a;
        backdrop-filter: blur(5px);
        transition:
            backdrop-filter 0.5s ease-in-out,
            background-color 0.35s ease-in-out;
        z-index: 2;
        margin-top: 0 !important;
    }

    .overlay-button {
        position: fixed;
        top: 0;
        @media (min-width: 1024px) {
            display: none;
        }
    }

    :global(.sub-navigation nav) {
        margin-left: -25px;
        border-top-left-radius: var(--border-radius-m);
        border-left-width: 1px;
        border-top-width: 1px;
        border-style: solid;
        border-color: var(--border-neutral);
    }
</style>
