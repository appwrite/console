<script lang="ts">
    import {
        Navbar,
        Icon,
        Layout,
        Link,
        Tooltip,
        Card,
        ActionMenu,
        Input,
        Button,
        Avatar
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
    import { DropList, Support, Breadcrumbs, BottomSheet } from '$lib/components';
    import { Feedback } from '$lib/components/feedback';
    import { feedback } from '$lib/stores/feedback';
    import { isMac } from '$lib/helpers/platform';
    import { base } from '$app/paths';
    import { logout } from '$lib/helpers/logout';
    import { app } from '$lib/stores/app';
    import { isSmallViewport } from '$lib/stores/viewport';

    let showSupport = false;

    type $$Props = BaseNavbarProps & {
        links: Array<{ label: string; href: string }>;
        organizations: Array<{
            name: string;
            $id: string;
            isSelected: boolean;
            tierName: string;
            projects: Array<{ name: string; $id: string; isSelected: boolean }>;
        }>;
        showAccountMenu: boolean;
    };

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
    export let showAccountMenu = false;
</script>

<Navbar.Base {...$$props}>
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
        <a href={base} class="only-desktop">
            <img src={logo.src} alt={logo.alt} />
        </a>
        <Breadcrumbs {organizations} />
    </div>
    <div slot="right" class="only-desktop">
        <div class="right">
            <Layout.Stack gap="l" direction="row">
                <DropList show={$feedback.show} scrollable on:blur={toggleFeedback}>
                    <Button.Button type="button" variant="compact" on:click={toggleFeedback}
                        >Feedback
                    </Button.Button>
                    <svelte:fragment slot="other">
                        <Feedback />
                    </svelte:fragment>
                </DropList>
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
                        on:click={() => (showSupport = !showSupport)}>
                        Support
                    </Button.Button>

                    <svelte:fragment slot="other">
                        <Support bind:show={showSupport} />
                    </svelte:fragment>
                </DropList>
            </Layout.Stack>
            <div class="icons">
                <Tooltip inline={false}>
                    <Link.Button
                        variant="quiet-muted"
                        aria-label="Toggle Command Center"
                        on:click={toggleCommandCenter}>
                        <Icon icon={IconSearch} />
                    </Link.Button>
                    <span slot="tooltip">{isMac() ? '⌘ + K' : 'Ctrl + K'}</span></Tooltip>
            </div>
            <Link.Button
                on:click={() => {
                    showAccountMenu = !showAccountMenu;
                }}>
                <Avatar size="s" src={avatar} />
            </Link.Button>
            {#if showAccountMenu}
                <div class="account-container">
                    <Card.Base padding="xxs" shadow={true}>
                        <Layout.Stack gap="xxs">
                            <ActionMenu.Root>
                                <Layout.Stack gap="xxs">
                                    <ActionMenu.Item.Anchor
                                        leadingIcon={IconUser}
                                        size="l"
                                        href={`${base}/account`}>
                                        Account</ActionMenu.Item.Anchor>

                                    <ActionMenu.Item.Button
                                        leadingIcon={IconLogoutRight}
                                        size="l"
                                        on:click={logout}>Sign out</ActionMenu.Item.Button>
                                </Layout.Stack>
                            </ActionMenu.Root>
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
{#if showAccountMenu && $isSmallViewport}
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
        border: var(--border-width-s, 1px) solid var(--color-border-neutral-strong, #d8d8db);
        background: var(--color-bgcolor-neutral-primary, #fff);
        cursor: pointer;
    }

    .only-desktop {
        display: none;
    }

    @media (min-width: 768px) {
        .only-mobile {
            display: none;
        }
    }
    @media (min-width: 1024px) {
        .only-mobile-tablet {
            display: none;
        }
        .only-desktop {
            display: flex;
        }
    }

    :global(.icons div:first-of-type:not(:has(.progress-card))) {
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

    /* The default drop list has a max-inline width of 280px, which squeezes the support modal. */
    :global(.extended-width) {
        max-inline-size: none;

        /* `desltop` is not a typo—it comes from the `pink2/legacy` module! */
        inline-size: var(--p-drop-width-size-desltop);
    }
</style>
