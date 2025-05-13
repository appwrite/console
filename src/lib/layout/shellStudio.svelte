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
    import ChatWrapper from '$lib/components/studio/chatWrapper.svelte';
    import { BillingPlan } from '$lib/constants.js';
    import { isCloud } from '$lib/system.js';
    import { tierToPlan } from '$lib/stores/billing.js';
    import type { NavbarProject } from '$lib/components/navbar.svelte';
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
    import { type Snippet } from 'svelte';

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
    let isOnEditorPage = $state(false);

    $effect(() => {
        isOnEditorPage =
            page.url.pathname.includes('studio') &&
            page.url.pathname.includes('artifact') &&
            'artifact' in page.params;
    });

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
</script>

<main>
    <Layout.Stack>
        <header
            style:background-color={$isSmallViewport
                ? 'var(--bgcolor-neutral-primary)'
                : 'var(--bgcolor-neutral-default)'}>
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
                <Layout.Stack inline height="32px">
                    <Link.Button
                        on:click={() => {
                            showAccountMenu = !showAccountMenu;
                            shouldAnimateThemeToggle = false;
                            if (showAccountMenu) {
                                trackEvent(Click.MenuDropDownClick);
                            }
                        }}>
                        <div style:user-select="none" style:width="32px">
                            <AvatarInitials name={$user?.name ?? ''} size="s" />
                        </div>
                    </Link.Button>
                </Layout.Stack>

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
                {#if isOnEditorPage}
                    <ChatWrapper />
                {/if}

                <Card.Base padding="xxs" radius={$isSmallViewport ? 'none' : 'm'}>
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
                    <Card.Base padding={isOnEditorPage ? 'xxs' : 's'}>
                        <Layout.Stack direction="row" gap={$showChat ? 'l' : 'none'}>
                            {#if isOnEditorPage}
                                <ChatWrapper />
                            {/if}

                            {@const Header = page.data.header}
                            {#if page.data.subNavigation}
                                {@const SubNavigation = page.data.subNavigation}
                                <SubNavigation />
                                <div
                                    style:padding-left="200px"
                                    style:width="100%"
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
    }

    .studio-wrapper {
        position: relative;
    }

    .studio-content {
        min-height: calc(100vh - 50px);
        margin-top: 50px;
        width: 100vw;
        position: relative;

        @media (min-width: 1024px) {
            min-height: calc(100vh - 54px);
            width: calc(100vw - 200px);
            margin-left: 200px;
            margin-top: 54px;
            padding-left: 0;
            padding-right: var(--space-4);
        }

        &.project-sidebar {
            @media (min-width: 1024px) {
                width: calc(100vw - 48px);
                margin-left: 48px;
            }
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
        margin-inline-start: -17px;
        margin-block-start: 6px;
        border-top-left-radius: var(--border-radius-m);
        height: calc(100% - 65px) !important;
        border-left-width: 1px;
        border-top-width: 1px;
        border-bottom: 0;
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
        width: 0;
    }
</style>
