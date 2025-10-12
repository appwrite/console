<script lang="ts" context="module">
    import type { HTMLAttributes } from 'svelte/elements';

    export type BaseNavbarProps = HTMLAttributes<HTMLHeadElement> & {
        logo: {
            src: {
                dark: string;
                light: string;
            };
            alt: string;
        };
        avatar: string;
        sideBarIsOpen: boolean;
    };
</script>

<script lang="ts">
    import {
        Navbar,
        Icon,
        Layout,
        Tooltip,
        ActionMenu,
        ToggleButton,
        Button,
        Avatar,
        Typography,
        Popover
    } from '@appwrite.io/pink-svelte';
    import { toggleCommandCenter } from '$lib/commandCenter/commandCenter.svelte';
    import {
        IconChevronRight,
        IconLogoutRight,
        IconMenuAlt4,
        IconMode,
        IconMoon,
        IconSearch,
        IconSun,
        IconUser
    } from '@appwrite.io/pink-icons-svelte';
    import { DropList, Support, Breadcrumbs, BottomSheet } from '$lib/components';
    import { Feedback } from '$lib/components/feedback';
    import { feedback } from '$lib/stores/feedback';
    import { isMac } from '$lib/helpers/platform';
    import { base } from '$app/paths';
    import { logout } from '$lib/helpers/logout';
    import { app } from '$lib/stores/app';
    import { isTabletViewport, isSmallViewport } from '$lib/stores/viewport';
    import { isCloud } from '$lib/system.js';
    import { user } from '$lib/stores/user';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { beforeNavigate } from '$app/navigation';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    let showSupport = false;

    type $$Props = BaseNavbarProps & {
        links?: Array<{ label: string; href: string }>;
        organizations: Array<{
            name: string;
            $id: string;
            isSelected: boolean;
            showUpgrade: boolean;
            tierName: string;
        }>;
        showAccountMenu: boolean;
    };

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

    function toggleFeedback() {
        trackEvent(Click.FeedbackSubmitClick);
        feedback.toggleFeedback();
        if ($feedback.notification) {
            feedback.toggleNotification();
            feedback.addVisualization();
        }
    }

    export let logo: $$Props['logo'];
    export let organizations: $$Props['organizations'];
    export let avatar: $$Props['avatar'];
    export let sideBarIsOpen: $$Props['sideBarIsOpen'] = false;
    export let showAccountMenu = false;
    export let currentProject: Models.Project = undefined;

    let activeTheme = $app.theme;
    let shouldAnimateThemeToggle = false;

    $: {
        if (activeTheme) {
            updateTheme(activeTheme);
        }
    }

    $: currentOrg = organizations.find((org) => org.isSelected);

    beforeNavigate(() => (showAccountMenu = false));
</script>

<Navbar.Base>
    <div slot="left" class="left">
        <div class="only-mobile-tablet">
            <button
                class="sideNavToggle"
                on:click={() => {
                    sideBarIsOpen = !sideBarIsOpen;
                }}>
                <Icon icon={IconMenuAlt4} />
            </button>
        </div>
        <a
            href={currentOrg?.$id ? `${base}/organization-${currentOrg?.$id}` : base}
            class="only-desktop">
            <img src={$app.theme === 'dark' ? logo.src.dark : logo.src.light} alt={logo.alt} />
        </a>

        <Breadcrumbs {organizations} {currentProject} />

        {#if page.route?.id?.includes('/project-[region]-[project]') && currentProject && currentProject.pingCount === 0}
            <div class="only-desktop" style:margin-inline-start="-16px">
                <Button.Anchor
                    size="xs"
                    variant="secondary"
                    href={`${base}/project-${currentProject.region}-${currentProject.$id}/get-started`}
                    >Connect</Button.Anchor>
            </div>
        {/if}
    </div>
    <div slot="right" class="only-desktop">
        <div class="right">
            <Layout.Stack gap="l" direction="row" alignItems="center">
                {#if isCloud && currentOrg?.showUpgrade}
                    <Button.Anchor
                        size="s"
                        variant="primary"
                        on:click={() => {
                            trackEvent(Click.OrganizationClickUpgrade, {
                                from: 'button',
                                source: 'top_nav'
                            });
                        }}
                        href={`${base}/organization-${currentOrg.$id}/change-plan`}
                        >Upgrade</Button.Anchor>
                {/if}

                {#if !$isSmallViewport}
                    <DropList show={$feedback.show} class="extended-width">
                        <Button.Button
                            type="button"
                            variant="compact"
                            on:click={() => {
                                toggleFeedback();
                                trackEvent(Click.FeedbackSubmitClick, { source: 'top_nav' });
                            }}
                            >Feedback
                        </Button.Button>
                        <svelte:fragment slot="other">
                            <Feedback />
                        </svelte:fragment>
                    </DropList>
                {/if}
                <DropList
                    noArrow
                    scrollable
                    width="28.25"
                    placement="bottom-end"
                    class="extended-width"
                    bind:show={showSupport}>
                    <Button.Button
                        variant="compact"
                        type="button"
                        on:click={() => {
                            showSupport = !showSupport;
                            trackEvent(Click.SupportOpenClick, { source: 'top_nav' });
                        }}>
                        Support
                    </Button.Button>

                    <svelte:fragment slot="other">
                        <Support bind:show={showSupport} />
                    </svelte:fragment>
                </DropList>
            </Layout.Stack>
            <Layout.Stack direction="row">
                <Tooltip>
                    <Button.Button
                        variant="text"
                        aria-label="Toggle Command Center"
                        on:click={toggleCommandCenter}
                        icon>
                        <Icon icon={IconSearch} />
                    </Button.Button>
                    <span slot="tooltip">{isMac() ? '⌘ + K' : 'Ctrl + K'}</span></Tooltip>
            </Layout.Stack>
            <Popover let:toggle let:showing>
                <button
                    type="button"
                    style:cursor="pointer"
                    on:click|preventDefault={(e) => {
                        toggle(e);
                        shouldAnimateThemeToggle = false;
                        if (showing) {
                            trackEvent(Click.MenuDropDownClick);
                        }
                    }}
                    style:user-select="none">
                    <Avatar size="s" src={avatar} />
                </button>
                <svelte:fragment slot="tooltip" let:toggle>
                    <ActionMenu.Root noPadding>
                        <Layout.Stack gap="xxs">
                            <div
                                style:padding-inline-start="10px"
                                style:padding-inline-end="8px"
                                style:padding-block="4px">
                                <Typography.Text variant="m-500">
                                    {$user?.email}
                                </Typography.Text>
                            </div>
                            <ActionMenu.Item.Anchor
                                size="l"
                                trailingIcon={IconUser}
                                href={`${base}/account`}
                                on:click={() => toggle()}>
                                Account</ActionMenu.Item.Anchor>

                            <ActionMenu.Item.Button
                                trailingIcon={IconLogoutRight}
                                size="l"
                                on:click={() => logout()}>Sign out</ActionMenu.Item.Button>
                            <div style:padding-inline-start="10px" style:padding-inline-end="8px">
                                <Layout.Stack
                                    justifyContent="space-between"
                                    direction="row"
                                    alignItems="center">
                                    <Typography.Text>Theme</Typography.Text>
                                    <div class:keepTransformTransition={shouldAnimateThemeToggle}>
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
                </svelte:fragment>
            </Popover>
        </div>
    </div>
</Navbar.Base>
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
    .left {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-shrink: 0;
        max-width: 100%;

        @media (min-width: 1024px) {
            gap: 17px;
        }
    }

    .right {
        display: flex;
        gap: var(--space-9, 24px);
    }

    :global(.right button) {
        flex-shrink: 0;
    }

    .sideNavToggle {
        display: flex;
        width: 28px;
        height: 28px;
        padding: var(--space-3, 6px);
        justify-content: center;
        align-items: center;
        gap: var(--space-4, 8px);
        border-radius: var(--border-radius-xs, 6px);
        border: var(--border-width-s, 1px) solid var(--border-neutral-strong, #d8d8db);
        background: var(--bgcolor-neutral-primary, #fff);
        cursor: pointer;
    }

    .only-desktop {
        display: none;
    }

    @media (min-width: 1024px) {
        .only-mobile-tablet {
            display: none;
        }
        .only-desktop {
            display: flex;
        }
    }

    /* The default drop list has a max-inline width of 280px, which squeezes the support modal. */
    :global(.extended-width) {
        max-inline-size: none;

        /* `desltop` is not a typo—it comes from the `pink2/legacy` module! */
        inline-size: var(--p-drop-width-size-desltop);
    }

    :global(.keepTransformTransition span) {
        transition: transform 0.2s ease-out !important;
    }
</style>
