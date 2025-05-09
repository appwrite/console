<script lang="ts">
    import { AvatarInitials, Breadcrumbs, BottomSheet } from '$lib/components/index.js';
    import {
        Layout,
        Card,
        Typography,
        Icon,
        Button,
        ActionMenu,
        ToggleButton,
        Link
    } from '@appwrite.io/pink-svelte';
    import { page } from '$app/state';
    import { app } from '$lib/stores/app';
    import { organizationList } from '$lib/stores/organization';
    import { user } from '$lib/stores/user';
    import SidebarProject from '$lib/components/studio/sidebarProject.svelte';
    import SidebarOrganization from '$lib/components/studio/sidebarOrganization.svelte';
    import { BillingPlan } from '$lib/constants.js';
    import { isCloud } from '$lib/system.js';
    import { tierToPlan } from '$lib/stores/billing.js';
    import type { NavbarProject } from '$lib/components/navbar.svelte';
    import Chat from '$lib/components/studio/chat/chat.svelte';
    import {
        IconChevronRight,
        IconLogoutRight,
        IconMenuAlt4,
        IconMode,
        IconMoon,
        IconSun,
        IconUser
    } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';
    import { isTabletViewport, isSmallViewport } from '$lib/stores/viewport';
    import { logout } from '$lib/helpers/logout';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { conversation, showChat } from '$lib/stores/chat';
    import { createStreamParser } from '$lib/components/studio/chat/parser';
    import { setContext, type Snippet } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { filesystem } from '$lib/components/editor/filesystem';
    import { previewFrameRef } from '$routes/(console)/project-[project]/store';
    import {
        disableBodySelect,
        enabledBodySelect,
        getChatWidthFromPrefs,
        saveChatWidthToPrefs
    } from '$lib/helpers/studioLayout';
    import { synapse } from '$lib/components/studio/synapse.svelte';

    let hasProjectSidebar = $state(false);

    $effect(() => {
        hasProjectSidebar = page.url.pathname.startsWith(base + '/project');
    });

    interface Props {
        loadedProjects: Array<NavbarProject>;
        children?: Snippet;
    }

    let { loadedProjects = [], children }: Props = $props();

    let showSideNavigation = $state(false);
    let shouldAnimateThemeToggle = $state(false);
    let showAccountMenu = $state(false);
    let activeTheme = $state($app.theme);

    function updateTheme(theme: 'light' | 'dark' | 'auto') {
        const themeInUse =
            theme === 'auto'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
                : theme;

        trackEvent('select_theme', {
            value: theme === 'auto' ? 'system' : theme
        });

        app.update(() => ({
            themeInUse: themeInUse,
            theme: theme
        }));
    }

    $effect(() => {
        if (activeTheme) {
            updateTheme(activeTheme);
        }
    });

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

    $effect(() => {
        if ($isSmallViewport || page.params.artifact) {
            showChat.set(true);
        }
    });

    let resizer = $state(null);
    let resizerLeftPosition = $state(
        page.data?.subNavigation ? getChatWidthFromPrefs() + 24 : getChatWidthFromPrefs()
    );
    let resizerLeftOffset = $state(page.data?.subNavigation ? 52 : 9);
    let chatWidth = $derived(resizerLeftPosition - resizerLeftOffset);

    $effect(() => {
        chatWidth = resizerLeftPosition - resizerLeftOffset;
    });

    let isResizing = false;

    function startResize() {
        isResizing = true;
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
        window.addEventListener('touchmove', resize);
        window.addEventListener('touchend', stopResize);
        disableBodySelect();

        if ($previewFrameRef) {
            $previewFrameRef.style.pointerEvents = 'none';
        }
    }

    function resize(event: TouchEvent | MouseEvent) {
        if (!isResizing) return;
        if (resizer) {
            resizerLeftPosition =
                ('touches' in event ? event.touches[0].clientX : event.clientX) - 60;
            const maxSize = page.data?.subNavigation
                ? window.innerWidth - 660
                : window.innerWidth - 460;

            const minSize = 320;
            if (resizerLeftPosition > maxSize) {
                resizerLeftPosition = maxSize;
            } else if (resizerLeftPosition < minSize) {
                if (resizerLeftPosition < minSize - 100) {
                    showChat.set(false);
                }

                resizerLeftPosition = minSize;
            } else if (resizerLeftPosition > minSize && !$showChat) {
                showChat.set(true);
            }
        }
    }

    function stopResize() {
        if (!$showChat) {
            resizerLeftPosition = 500;
        }
        const saveWidth = page.data?.subNavigation ? resizerLeftPosition - 24 : resizerLeftPosition;
        saveChatWidthToPrefs(saveWidth);

        isResizing = false;
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
        window.removeEventListener('touchmove', resize);
        window.removeEventListener('touchend', stopResize);
        enabledBodySelect();

        if ($previewFrameRef) {
            $previewFrameRef.style.pointerEvents = '';
        }
    }

    const parser = createStreamParser();

    async function getConversation(artifactId: string) {
        const { conversations } = await sdk.forProject.imagine.listConversations(artifactId);
        if (conversations.length === 0) {
            const convo = await sdk.forProject.imagine.createConversation(
                artifactId,
                `Conversation ${new Date().getTime()}`
            );
            conversation.set(convo);
        } else {
            conversation.set(conversations[0]);
        }
    }

    $effect(() => {
        if (page.params.artifact && !$conversation) {
            getConversation(page.params.artifact);
        }
    });

    conversation.subscribe(async (convo) => {
        if (!convo) return;
        const { messages } = await sdk.forProject.imagine.listMessages(convo.artifactId, convo.$id);
        const text = messages.reduce((curr, next) => {
            return curr + next.content;
        }, '');
        parser.init(text);
    });

    parser.on('complete', async (action) => {
        if (action.type === 'file') {
            await synapse.dispatch('fs', {
                operation: 'createFile',
                params: {
                    filepath: action.src,
                    content: action.content
                }
            });
            $filesystem = [...$filesystem, action.src];
        }
    });
</script>

<main>
    <Layout.Stack>
        <header>
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Layout.Stack direction="row" alignItems="center" gap="none">
                    <div class="only-mobile-tablet">
                        {#if page.data.organization}
                            <Button.Button
                                variant="secondary"
                                size="xs"
                                on:click={() => {
                                    showSideNavigation = !showSideNavigation;
                                }}
                                ><Icon
                                    icon={IconMenuAlt4}
                                    color="--fgcolor-neutral-tertiary" /></Button.Button>
                        {/if}
                    </div>
                    <Breadcrumbs {organizations} />
                </Layout.Stack>
                <Link.Button
                    on:click={() => {
                        showAccountMenu = !showAccountMenu;
                        shouldAnimateThemeToggle = false;
                        if (showAccountMenu) {
                            trackEvent(Click.MenuDropDownClick);
                        }
                    }}>
                    <div style:user-select="none">
                        <AvatarInitials name={$user?.name ?? ''} size="s" />
                    </div>
                </Link.Button>

                {#if showAccountMenu}
                    <div class="account-container">
                        <Card.Base padding="xxxs" shadow={true}>
                            <Layout.Stack gap="xxs">
                                <ActionMenu.Root>
                                    <Layout.Stack gap="xxs">
                                        <div
                                            style:padding-inline-start="10px"
                                            style:padding-inline-end="8px"
                                            style:padding-block="4px">
                                            <Typography.Text variant="m-500">
                                                {$user.email}
                                            </Typography.Text>
                                        </div>
                                        <ActionMenu.Item.Anchor
                                            trailingIcon={IconUser}
                                            size="l"
                                            href={`${base}/account`}>
                                            Account</ActionMenu.Item.Anchor>

                                        <ActionMenu.Item.Button
                                            trailingIcon={IconLogoutRight}
                                            size="l"
                                            on:click={() => logout()}
                                            >Sign out</ActionMenu.Item.Button>
                                        <div
                                            style:padding-inline-start="10px"
                                            style:padding-inline-end="8px">
                                            <Layout.Stack
                                                justifyContent="space-between"
                                                direction="row"
                                                alignItems="center">
                                                <Typography.Text>Theme</Typography.Text>
                                                <div
                                                    class:keepTransformTransition={shouldAnimateThemeToggle}>
                                                    <ToggleButton
                                                        bind:active={activeTheme}
                                                        on:change={() => {
                                                            setTimeout(() => {
                                                                shouldAnimateThemeToggle = true;
                                                            }, 150);
                                                        }}
                                                        buttons={[
                                                            {
                                                                id: 'light',
                                                                label: 'Light',
                                                                icon: IconSun
                                                            },
                                                            {
                                                                id: 'dark',
                                                                label: 'Dark',
                                                                icon: IconMoon
                                                            },
                                                            {
                                                                id: 'auto',
                                                                label: 'System',
                                                                icon: IconMode
                                                            }
                                                        ]}></ToggleButton>
                                                </div>
                                            </Layout.Stack>
                                        </div>
                                    </Layout.Stack>
                                </ActionMenu.Root>
                            </Layout.Stack>
                        </Card.Base>
                    </div>
                    <button
                        class="account-backdrop"
                        aria-label="Account menu"
                        onclick={() => {
                            showAccountMenu = false;
                        }}></button>
                {/if}
            </Layout.Stack>
        </header>
        <div
            class="studio-content"
            class:project-sidebar={hasProjectSidebar}
            class:sub-navigation={page.data.subNavigation}>
            {#if $isSmallViewport}
                {#if hasProjectSidebar}
                    <Chat {parser} width={chatWidth} hasSubNavigation={page.data?.subNavigation} />
                {/if}
                <Card.Base>
                    <Layout.Stack>
                        {#if page.data?.subNavigation}
                            {@const Component = page.data.subNavigation}
                            <Component />
                        {/if}
                        {@render children()}
                    </Layout.Stack>
                </Card.Base>
            {:else}
                <div class="studio-wrapper">
                    <Card.Base padding="xxs">
                        <Layout.Stack direction="row" gap={$showChat ? 'l' : 'none'}>
                            {#if hasProjectSidebar}
                                <Chat {parser} width={chatWidth} hasSubNavigation={false} />
                                {#if $showChat || isResizing}
                                    <div
                                        role="presentation"
                                        class="resizer"
                                        style:left={`${resizerLeftPosition}px`}
                                        class:hidden={!$showChat}
                                        bind:this={resizer}
                                        onmousedown={startResize}
                                        ontouchmove={startResize}>
                                    </div>
                                {/if}
                            {/if}

                            {@const Header = page.data.header}
                            {#if page.data.subNavigation}
                                {@const SubNavigation = page.data.subNavigation}
                                <SubNavigation />
                                <div
                                    style:padding-left="200px"
                                    style:min-height="calc(100vh - 98px)">
                                    <Layout.Stack>
                                        {#if page.data?.header}
                                            <Header />
                                        {/if}
                                        {@render children()}
                                    </Layout.Stack>
                                </div>
                            {:else}
                                <div class="editor-wrapper">
                                    <Layout.Stack>
                                        {#if page.data?.header}
                                            <Header />
                                        {/if}
                                        {@render children()}
                                    </Layout.Stack>
                                </div>
                            {/if}
                        </Layout.Stack>
                    </Card.Base>
                </div>
            {/if}
        </div>
        {#if hasProjectSidebar}
            {#if page.data.project}
                <SidebarProject project={page.data.project} bind:isOpen={showSideNavigation} />
            {/if}
        {:else if page.data.organization}
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

{#if showAccountMenu && $isTabletViewport}
    <BottomSheet.Menu
        bind:isOpen={showAccountMenu}
        menu={{
            top: {
                items: [
                    {
                        name: 'Account',
                        leadingIcon: IconUser,
                        href: `${base}/account`
                    },
                    {
                        name: 'Sign out',
                        leadingIcon: IconLogoutRight,
                        onClick: logout
                    }
                ]
            },
            bottom: {
                items: [
                    {
                        name: 'Theme',
                        leadingIcon: IconMode,
                        trailingIcon: IconChevronRight,
                        subMenu: {
                            top: {
                                title: 'Theme',
                                items: [
                                    {
                                        name: 'Light',
                                        leadingIcon: IconSun,
                                        onClick: () => {
                                            updateTheme('light');
                                        }
                                    },
                                    {
                                        name: 'Dark',
                                        leadingIcon: IconMoon,
                                        onClick: () => {
                                            updateTheme('dark');
                                        }
                                    },
                                    {
                                        name: 'System',
                                        leadingIcon: IconMode,
                                        onClick: () => {
                                            updateTheme('auto');
                                        }
                                    }
                                ]
                            },
                            bottom: undefined
                        }
                    }
                ]
            }
        }}></BottomSheet.Menu>
{/if}

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

    .studio-wrapper {
        position: relative;
    }

    .studio-content {
        min-height: calc(100vh - 54px);
        margin-top: 32px;
        width: 100vw;
        position: relative;

        padding-right: var(--space-4);
        padding-left: var(--space-4);

        @media (min-width: 1024px) {
            width: calc(100vw - 200px);
            margin-left: 200px;
            margin-top: 54px;
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
        width: 16px;
        cursor: col-resize;
        margin-inline: 10px;
        position: absolute;
        height: calc(100vh - 72px);
        margin-block-start: calc(-1 * var(--base-8));
        margin-inline-start: 0;

        &::after {
            content: '';
            cursor: col-resize;
            position: absolute;
            height: 100%;
            width: 1px;
            margin-left: -1px;
            left: 8px;
            background-color: var(--border-neutral);
            opacity: 1;
            transition: all 0.3s ease-in-out;
        }

        &:hover::after {
            width: 2px;
            background-color: var(--border-neutral-strong);
        }
    }
    .hidden {
        opacity: 0;
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

    .account-container {
        position: absolute;
        right: var(--space-7);
        top: var(--base-44);
        width: 244px;
        display: flex;
        z-index: 1;
    }

    .account-backdrop {
        position: absolute;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: transparent;
    }

    .editor-wrapper {
        flex-grow: 1;
        padding-inline: var(--space-4);
    }
</style>
