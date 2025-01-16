<script lang="ts">
    import {
        Navbar,
        Icon,
        Layout,
        Link,
        Tooltip,
        Card,
        ActionList,
        Input,
        BottomSheet
    } from '@appwrite.io/pink-svelte';
    import { toggleCommandCenter } from '$lib/commandCenter/commandCenter.svelte';
    import type { BaseNavbarProps } from '@appwrite.io/pink-svelte/dist/navbar/Base.svelte';
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
    import { DropList, Support, BreadcrumbsConsole } from '$lib/components';
    import { Feedback } from '$lib/components/feedback';
    import { feedback } from '$lib/stores/feedback';
    import { isMac } from '$lib/helpers/platform';
    import { base } from '$app/paths';
    import { logout } from '$lib/helpers/logout';
    import { app } from '$lib/stores/app';
    import { onMount } from 'svelte';

    let showSupport = false;
    let isSmallViewport = false;

    type $$Props = BaseNavbarProps & {
        links: Array<{ label: string; href: string }>;
        organizations: Array<{
            name: string;
            id: string;
            isSelected?: boolean;
            tier: string;
            projects: Array<{ name: string; id: string }>;
        }>;
        showSideNavigation: boolean;
        showAccountMenu: boolean;
    };

    onMount(() => {
        if (window) {
            const mediaQuery = window.matchMedia('(max-width: 768px)');
            const updateViewport = () => (isSmallViewport = mediaQuery.matches);

            // Initial check
            updateViewport();

            // Listen for changes
            mediaQuery.addEventListener('change', updateViewport);

            return () => {
                // Cleanup listener
                mediaQuery.removeEventListener('change', updateViewport);
            };
        }
    });

    function updateTheme(theme: 'light' | 'dark' | 'system') {
        const themeInUse =
            theme === 'system'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
                : theme;

        app.update(() => ({
            themeInUse: themeInUse,
            theme: theme === 'system' ? 'auto' : theme
        }));
    }

    function toggleFeedback() {
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
    export let showSideNavigation: boolean;
    export let showAccountMenu = false;
</script>

<Navbar.Base {...$$props}>
    <div slot="left" class="left">
        {#if showSideNavigation}
            <div class="only-mobile-tablet">
                <button
                    class="sideNavToggle"
                    on:click={() => {
                        sideBarIsOpen = !sideBarIsOpen;
                    }}><Icon icon={IconMenuAlt4} /></button>
            </div>
        {/if}
        <img src={logo.src} alt={logo.alt} class="only-desktop" />
        <BreadcrumbsConsole {organizations} />
    </div>
    <div slot="right" class="only-desktop">
        <div class="right">
            <Layout.Stack gap="l" direction="row">
                <DropList show={$feedback.show} scrollable on:blur={toggleFeedback}>
                    <Link.Button variant="quiet" size="m" on:click={toggleFeedback}
                        >Feedback</Link.Button>
                    <svelte:fragment slot="other">
                        <Feedback />
                    </svelte:fragment>
                </DropList>
                <DropList
                    class="support-drop-section"
                    bind:show={showSupport}
                    scrollable={true}
                    noArrow
                    placement="bottom-end">
                    <Link.Button
                        variant="quiet"
                        size="m"
                        on:click={() => (showSupport = !showSupport)}>
                        Support</Link.Button>

                    <svelte:fragment slot="other">
                        <Support bind:show={showSupport} />
                    </svelte:fragment>
                </DropList>
            </Layout.Stack>
            <div class="icons">
                <Tooltip inline={false}
                    ><Link.Button
                        variant="quiet-muted"
                        aria-label="Toggle Command Center"
                        on:click={toggleCommandCenter}><Icon icon={IconSearch} /></Link.Button
                    ><span slot="tooltip">{isMac() ? '⌘ + K' : 'Ctrl + K'}</span></Tooltip>
            </div>
            <Link.Button
                on:click={() => {
                    showAccountMenu = !showAccountMenu;
                }}><img src={avatar} alt={'Avatar'} class="avatar" /></Link.Button>
            {#if showAccountMenu}
                <div class="account-container">
                    <Card.Base padding="xxs" shadow={true}>
                        <Layout.Stack gap="xxs">
                            <ActionList.Root>
                                <ActionList.Item.Anchor
                                    icon={IconUser}
                                    title="Account"
                                    href={`${base}/account`} />

                                <ActionList.Item.Button
                                    icon={IconLogoutRight}
                                    on:click={logout}
                                    title="Sign out" />
                            </ActionList.Root>
                            <Input.Select
                                value={$app.theme === 'auto' ? 'system' : $app.theme}
                                name="mode"
                                on:change={(event) => {
                                    updateTheme(event.detail);
                                }}
                                bind:group={$app.theme}
                                options={[
                                    { label: 'Light', value: 'light', leadingIcon: IconSun },
                                    { label: 'Dark', value: 'dark', leadingIcon: IconMoon },
                                    { label: 'System', value: 'system', leadingIcon: IconMode }
                                ]} />
                        </Layout.Stack>
                    </Card.Base>
                </div>
                <button
                    class="account-backdrop"
                    on:click={() => {
                        showAccountMenu = false;
                    }} />
            {/if}
        </div>
    </div>
</Navbar.Base>
{#if showAccountMenu && isSmallViewport}
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
                                            updateTheme('system');
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        }}></BottomSheet.Menu>
{/if}

<style lang="scss">
    .left {
        display: flex;
        gap: 17px;
        align-items: center;
        flex-shrink: 0;
        max-width: 100%;
    }

    .right {
        display: flex;
        align-items: center;
        gap: var(--space-9, 24px);

        .icons {
            display: flex;
            gap: var(--space-5, 10px);
        }

        img {
            max-inline-size: none;
            max-block-size: none;
        }
    }

    .avatar {
        width: 32px;
        aspect-ratio: 1 /1;
        border-radius: var(--border-radius-circle, 99999px);
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
        border: var(--border-width-s, 1px) solid var(--color-border-neutral-strong, #d8d8db);
        background: var(--color-bgcolor-neutral-primary, #fff);
        cursor: pointer;
    }

    .only-desktop {
        display: none;
    }

    .only-mobile-tablet {
        display: block;
    }

    @media (min-width: 768px) {
        .only-desktop {
            display: block;
        }
    }

    @media (min-width: 1024px) {
        .only-mobile-tablet {
            display: none;
        }
    }
    :global(.icons div:first-of-type) {
        height: 20px;
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
</style>
