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
    import { base } from '$app/paths';
    import { isTabletViewport, isSmallViewport } from '$lib/stores/viewport';
    import { derived, writable } from 'svelte/store';

    $: hasProjectSidebar = $page.url.pathname.startsWith(base + '/project');

    export let loadedProjects: Array<NavbarProject> = [];
    $: showSideNavigation = !($isTabletViewport || $isSmallViewport);

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

    const showChat = writable(false);
    const pathnameWatcher = derived(page, ($page) => {
        if ($page.url.pathname.endsWith('studio')) {
            showChat.set(true);
        }
    });

    pathnameWatcher.subscribe(() => {});

    let resizer;
    $: resizerLeftPosition = $page.data?.subNavigation ? 360 : 500;
    $: resizerLeftOffset = $page.data?.subNavigation ? 0 : 52;
    $: chatWidth = resizerLeftPosition - resizerLeftOffset;

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
            resizerLeftPosition = $page.data?.subNavigation ? event.clientX - 280 : event.clientX;
            const maxSize = $page.data?.subNavigation
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
            class:sub-navigation={$page.data.subNavigation}>
            {#if $isSmallViewport}
                {#if hasProjectSidebar}
                    <Chat
                        bind:showChat={$showChat}
                        width={chatWidth}
                        hasSubNavigation={$page.data?.subNavigation} />
                {/if}
                <Card.Base>
                    <Layout.Stack>
                        {#if $page.data?.subNavigation}
                            <svelte:component this={$page.data.subNavigation} />
                        {/if}
                        <slot />
                    </Layout.Stack>
                </Card.Base>
            {:else}
                <Layout.Stack direction="row" gap="l">
                    {#if hasProjectSidebar}
                        <Chat
                            bind:showChat={$showChat}
                            width={chatWidth}
                            hasSubNavigation={$page.data?.subNavigation} />
                        {#if $showChat}
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
            {/if}
        </div>
        {#if hasProjectSidebar}
            <SidebarProject
                project={$page.data.project}
                bind:showChat={$showChat}
                bind:isOpen={showSideNavigation} />
            {#if $page.data.subNavigation}
                <div class="sub-navigation">
                    <svelte:component this={$page.data.subNavigation} />
                </div>
            {/if}
        {:else}
            <SidebarOrganization
                organization={$page.data.organization}
                bind:isOpen={showSideNavigation} />
        {/if}
    </Layout.Stack>
</main>

<button
    type="button"
    class="overlay-button"
    aria-label="Close sidebar"
    class:overlay={showSideNavigation}
    on:click={() => {
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

            &.sub-navigation {
                margin-top: 96px;
                @media (min-width: 1024px) {
                    margin-top: 48px;
                    width: calc(100vw - 320px);
                    margin-left: 215px;
                }
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

    .sub-navigation {
        position: fixed;

        @media (min-width: 1024px) {
            left: 53px;
        }
        nav {
            top: 49px;
        }
    }

    :global(.sub-navigation nav),
    :global(.sub-navigation header) {
        --bgcolor-neutral-primary: var(--bgcolor-neutral-default);
        --border-width-s: 0;
    }
</style>
