<script lang="ts">
    import { fade } from 'svelte/transition';
    import { page } from '$app/stores';
    import { app } from '$lib/stores/app';
    import {
        Icon,
        Sidebar,
        ProgressCircle,
        Tooltip,
        Divider,
        Link,
        Button,
        Layout,
        Avatar,
        Typography
    } from '@appwrite.io/pink-svelte';

    import {
        IconChartBar,
        IconChatBubble,
        IconCog,
        IconDatabase,
        IconFolder,
        IconGlobeAlt,
        IconLightningBolt,
        IconSearch,
        IconUserGroup
    } from '@appwrite.io/pink-icons-svelte';
    import { toggleCommandCenter } from '$lib/commandCenter/commandCenter.svelte';
    import { feedback } from '$lib/stores/feedback';
    import { DropList } from '$lib/components/index';
    import type { ComponentType } from 'svelte';
    import { showSupportModal } from '$routes/(console)/wizard/support/store';
    import MobileSupportModal from '$routes/(console)/wizard/support/mobileSupportModal.svelte';
    import MobileFeedbackModal from '$routes/(console)/wizard/feedback/mobileFeedbackModal.svelte';
    import { getSidebarState, updateSidebarState } from '$lib/helpers/sidebar';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { Click, trackEvent } from '$lib/actions/analytics';

    import type { HTMLAttributes } from 'svelte/elements';

    type $$Props = HTMLAttributes<HTMLElement> & {
        state?: 'closed' | 'open' | 'icons';
        project: { $id: string } | undefined;
        avatar: string;
        progressCard?: {
            title: string;
            percentage: number;
        };
        sideBarIsOpen: boolean;
        showAccountMenu: boolean;
        subNavigation?: ComponentType;
    };

    export let state: $$Props['state'] = 'icons';
    export let project: $$Props['project'];
    export let avatar: $$Props['avatar'];
    export let progressCard: $$Props['progressCard'] = undefined;
    export let sideBarIsOpen: boolean;
    export let showAccountMenu: boolean;
    export let subNavigation = undefined;

    function toggleFeedback() {
        trackEvent(Click.FeedbackSubmitClick);
        feedback.toggleFeedback();
        if ($feedback.notification) {
            feedback.toggleNotification();
            feedback.addVisualization();
        }
    }

    $: state = $isTabletViewport ? 'closed' : getSidebarState();
    $: pathname = $page.url.pathname;
    $: isOnProjectSettings = /^\/console\/project-[a-zA-Z0-9-]+\/settings$/.test(pathname);

    const projectOptions = [
        { name: 'Auth', icon: IconUserGroup, slug: 'auth', category: 'build' },
        { name: 'Databases', icon: IconDatabase, slug: 'databases', category: 'build' },
        { name: 'Functions', icon: IconLightningBolt, slug: 'functions', category: 'build' },
        { name: 'Messaging', icon: IconChatBubble, slug: 'messaging', category: 'build' },
        { name: 'Storage', icon: IconFolder, slug: 'storage', category: 'build' },
        { name: 'Sites', icon: IconGlobeAlt, slug: 'sites', category: 'deploy' }
    ];
</script>

<div
    class:only-mobile-tablet={project === undefined}
    style:--overlay-on-neutral={$app.themeInUse === 'dark'
        ? 'var(--neutral-750)'
        : 'var(--neutral-100)'}>
    <Sidebar.Base
        {...$$props}
        bind:state
        on:resize={(event) => updateSidebarState(event.detail)}
        resizable>
        <div slot="top">
            <div class="only-mobile-tablet top">
                <div class="icons search-icon">
                    <Button.Button
                        variant="text"
                        on:click={() => {
                            toggleCommandCenter();
                            state = 'closed';
                            sideBarIsOpen = false;
                        }}>
                        <Icon icon={IconSearch} color="--fgcolor-neutral-tertiary" />
                    </Button.Button>
                </div>
                <Link.Button
                    on:click={() => {
                        showAccountMenu = !showAccountMenu;
                    }}>
                    <Avatar size="s" src={avatar} />
                </Link.Button>
            </div>
        </div>
        <div slot="middle" class:icons={state === 'icons'}>
            {#if progressCard}
                <Tooltip placement="right" disabled={state !== 'icons'}>
                    <a
                        class="progress-card"
                        href={`/console/project-${project.$id}/get-started`}
                        on:click={() => {
                            trackEvent('click_menu_get_started');
                            sideBarIsOpen = false;
                        }}>
                        <div class="progressCircle">
                            <ProgressCircle size="s" progress={progressCard.percentage} />
                        </div>
                        {#if state !== 'icons'}
                            <div class="info" in:fade={{ delay: 200, duration: 200 }}>
                                <Typography.Text variant="m-500" color="--fgcolor-neutral-secondary"
                                    >{progressCard.title}</Typography.Text>
                                <Typography.Text color="--fgcolor-neutral-secondary"
                                    >{progressCard.percentage}% complete</Typography.Text>
                            </div>
                        {/if}
                    </a>
                    <span slot="tooltip">Getting started</span>
                </Tooltip>
            {/if}
            {#if project}
                <Layout.Stack direction="column" gap="s">
                    <Tooltip placement="right" disabled={state !== 'icons'}>
                        <a
                            href={`/console/project-${project.$id}/overview`}
                            class="link"
                            class:active={pathname.includes('overview')}
                            on:click={() => {
                                trackEvent(Click.MenuOverviewClick);
                                sideBarIsOpen = false;
                            }}
                            ><span class="link-icon"
                                ><Icon icon={IconChartBar} size="s" />
                            </span><span
                                class:no-text={state === 'icons'}
                                class:has-text={state === 'open'}
                                class="link-text">Overview</span
                            ></a>
                        <span slot="tooltip">Overview</span>
                    </Tooltip>
                    <div class="only-mobile divider">
                        <Divider />
                    </div>
                    <div class="products-label-container">
                        <span class="products-label" class:hidden={state === 'icons'}>Build</span>
                        <span class="products-label-indicator" class:hidden={state !== 'icons'}
                        ></span>
                    </div>
                    {@const buildProjectOptions = projectOptions.filter(
                        (projectOption) => projectOption.category === 'build'
                    )}
                    {#each buildProjectOptions as projectOption}
                        <Tooltip placement="right" disabled={state !== 'icons'}>
                            <a
                                href={`/console/project-${project.$id}/${projectOption.slug}`}
                                class="link"
                                class:active={pathname.includes(projectOption.slug)}
                                on:click={() => {
                                    trackEvent(`click_menu_${projectOption.slug}`);
                                    sideBarIsOpen = false;
                                }}
                                ><span class="link-icon"
                                    ><Icon icon={projectOption.icon} size="s" />
                                </span><span
                                    class:no-text={state === 'icons'}
                                    class:has-text={state === 'open'}
                                    class="link-text">{projectOption.name}</span
                                ></a>
                            <span slot="tooltip">{projectOption.name}</span>
                        </Tooltip>
                    {/each}
                    <div class="only-mobile divider">
                        <Divider />
                    </div>
                    <div class="products-label-container">
                        <span class="products-label" class:hidden={state === 'icons'}>Deploy</span>
                        <span class="products-label-indicator" class:hidden={state !== 'icons'}
                        ></span>
                    </div>
                    {@const deployProjectOptions = projectOptions.filter(
                        (projectOption) => projectOption.category === 'deploy'
                    )}
                    {#each deployProjectOptions as projectOption}
                        <Tooltip placement="right" disabled={state !== 'icons'}>
                            <a
                                href={`/console/project-${project.$id}/${projectOption.slug}`}
                                class="link"
                                class:active={pathname.includes(projectOption.slug)}
                                on:click={() => {
                                    trackEvent(`click_menu_${projectOption.slug}`);
                                    sideBarIsOpen = false;
                                }}
                                ><span class="link-icon"
                                    ><Icon icon={projectOption.icon} size="s" />
                                </span><span
                                    class:no-text={state === 'icons'}
                                    class:has-text={state === 'open'}
                                    class="link-text">{projectOption.name}</span
                                ></a>
                            <span slot="tooltip">{projectOption.name}</span>
                        </Tooltip>
                    {/each}
                    <div class="only-mobile divider">
                        <Divider />
                    </div>
                    <div class="only-mobile">
                        <Tooltip placement="right" disabled={state !== 'icons'}>
                            <a
                                href={`/console/project-${project.$id}/settings`}
                                on:click={() => {
                                    trackEvent('click_menu_settings');
                                }}
                                class="link"
                                ><span class="link-icon"><Icon icon={IconCog} size="s" /></span
                                ><span
                                    class:no-text={state === 'icons'}
                                    class:has-text={state === 'open'}
                                    class="link-text">Settings</span
                                ></a>
                            <span slot="tooltip">Settings</span>
                        </Tooltip>
                    </div>
                </Layout.Stack>
            {:else}
                <div class="action-buttons">
                    <Layout.Stack direction="column" gap="s">
                        <DropList show={$feedback.show} scrollable>
                            <Button.Button
                                variant="secondary"
                                size="s"
                                on:click={() => {
                                    toggleFeedback();
                                    trackEvent(Click.FeedbackSubmitClick, { source: 'side_nav' });
                                }}
                                >Feedback
                            </Button.Button>
                            <svelte:fragment slot="other">
                                <MobileFeedbackModal />
                            </svelte:fragment>
                        </DropList>

                        <DropList show={$showSupportModal} scrollable>
                            <Button.Button
                                variant="secondary"
                                size="s"
                                on:click={() => {
                                    $showSupportModal = true;
                                    trackEvent(Click.SupportOpenClick, { source: 'side_nav' });
                                }}>
                                <span>Support</span>

                                <svelte:fragment slot="other">
                                    <MobileSupportModal bind:show={$showSupportModal}
                                    ></MobileSupportModal>
                                </svelte:fragment>
                            </Button.Button>
                        </DropList>
                    </Layout.Stack>
                </div>
            {/if}
        </div>
        <div slot="bottom" class="bottom" class:icons={state === 'icons'}>
            {#if project}
                <div class="only-desktop">
                    <Tooltip placement="right" disabled={state !== 'icons'}>
                        <a
                            href={`/console/project-${project.$id}/settings`}
                            class="link"
                            on:click={() => {
                                trackEvent('click_menu_settings');
                            }}
                            class:active={isOnProjectSettings}
                            ><span class="link-icon"><Icon icon={IconCog} size="s" /></span><span
                                class:no-text={state === 'icons'}
                                class:has-text={state === 'open'}
                                class="link-text">Settings</span
                            ></a>
                        <span slot="tooltip">Settings</span>
                    </Tooltip>
                </div>
            {/if}

            {#if project}
                <div class="only-mobile">
                    <div class="action-buttons">
                        <Layout.Stack direction="column" gap="s">
                            <DropList show={$feedback.show} scrollable>
                                <Button.Button
                                    variant="secondary"
                                    size="s"
                                    on:click={() => {
                                        toggleFeedback();
                                        trackEvent('click_menu_feedback', { source: 'side_nav' });
                                    }}
                                    ><span>Feedback</span>
                                </Button.Button>
                                <svelte:fragment slot="other">
                                    <MobileFeedbackModal />
                                </svelte:fragment>
                            </DropList>

                            <DropList show={$showSupportModal} scrollable>
                                <Button.Button
                                    variant="secondary"
                                    size="s"
                                    on:click={() => {
                                        $showSupportModal = true;
                                        trackEvent(Click.SupportOpenClick, { source: 'side_nav' });
                                    }}>
                                    <span>Support</span>

                                    <svelte:fragment slot="other">
                                        <MobileSupportModal bind:show={$showSupportModal}
                                        ></MobileSupportModal>
                                    </svelte:fragment>
                                </Button.Button>
                            </DropList>
                        </Layout.Stack>
                    </div>
                </div>
            {/if}
        </div>
    </Sidebar.Base>
</div>

{#if subNavigation}
    <div class="sub-navigation" class:icons={state === 'icons'}>
        <svelte:component this={subNavigation} />
    </div>
{/if}

<style lang="scss">
    .link {
        display: flex;
        height: 32px;
        padding: var(--space-4, 8px);
        align-items: center;
        gap: var(--gap-s, 8px);
        flex-shrink: 0;
        border-radius: var(--border-radius-s, 8px);
        transition: all 0.2s ease-in-out;
        text-decoration: none;

        .link-icon {
            height: 16px;
            color: var(--fgcolor-neutral-weak);
            transition: color 0.2s ease-in-out;
        }

        &:hover {
            background: var(--bgcolor-neutral-secondary);

            .link-icon {
                color: var(--fgcolor-neutral-tertiary);
            }
        }

        &:focus-visible {
            background: var(--bgcolor-neutral-secondary);

            /* box-shadow/state/focus */
            box-shadow:
                var(--shadow-offsetx-0, 0px) var(--shadow-offsety-0, 0px) 0 2px
                    var(--bgcolor-neutral-default, #fafafb),
                0px 0px 0px 4px var(--border-focus, #818186);
        }

        &:active {
            background: var(--bgcolor-neutral-secondary, #f4f4f7);

            .link-text {
                color: var(--fgcolor-neutral-primary);
            }

            .link-icon {
                color: var(--fgcolor-neutral-tertiary);
            }
        }
    }
    .active {
        background: var(--bgcolor-neutral-secondary, #f4f4f7);
        .link-text {
            color: var(--fgcolor-neutral-primary);
        }
        .link-icon {
            color: var(--fgcolor-neutral-tertiary);
        }
    }

    .icons .link {
        gap: 0;
        width: 32px;
    }

    .search-icon {
        display: flex;
    }

    .link-text {
        width: 128px;
        transition: all 0.2s ease-in-out;
        transition-behavior: allow-discrete;
        opacity: 1;
        visibility: visible;
        color: var(--fgcolor-neutral-secondary, #56565c);
        filter: blur(0);

        &.has-text {
            transition-delay: 0.1s;
        }

        &.no-text {
            visibility: hidden;
            opacity: 0;
            width: 0;
            filter: blur(2px);
            transition-delay: 0s;
        }
    }

    .action-buttons {
        margin-top: var(--gap-s);

        span {
            width: 144px;
            text-align: center;
        }

        :global(div),
        :global(button) {
            width: 100%;
        }
    }

    .top {
        display: flex;
        width: 199px;
        max-height: 48px;
        padding: var(--space-4, 8px) var(--space-7, 16px);
        margin-left: calc(-1 * var(--space-7, 16px));
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--gap-s, 8px);

        border-bottom: var(--border-width-s, 1px) solid var(--border-neutral, #ededf0);
        background: var(--bgcolor-neutral-primary, #fff);
    }

    .products-label-container {
        height: 20px;
        display: flex;
        @media (min-width: 1024px) {
            margin-block-end: var(--space-2, 4px);
            margin-block-start: var(--space-9, 24px);
        }
    }

    .icons .products-label-container {
        margin-block-start: var(--base-20, 20px);
        margin-block-end: var(--base-8, 8px);
    }

    .products-label {
        font-size: var(--font-size-xs);
        color: var(--fgcolor-neutral-tertiary);
    }

    .products-label-indicator {
        border-bottom: 1px solid var(--border-neutral);
        height: 1px;
        width: 18px;
        align-self: center;
        margin-inline: 8px;
        @media (min-width: 1024px) {
            margin-block-end: var(--space-2, 4px);
            margin-block-start: var(--space-9, 24px);
        }
    }

    .hidden,
    .only-desktop {
        display: none;
    }

    .only-mobile {
        display: flex;
    }

    @media (min-width: 768px) {
        .only-mobile {
            display: none;
        }
    }

    @media (min-width: 1024px) {
        .only-mobile,
        .only-mobile-tablet {
            display: none;
        }
        .only-desktop {
            display: inline;
        }
    }

    .progress-card {
        height: 60px;
        width: 168px;
        padding: var(--base-8, 8px);
        display: flex;
        gap: var(--space-5, 10px);
        margin-block-end: var(--space-6, 12px);
        align-self: stretch;
        border-radius: var(--border-radius-s, 8px);
        border: 1px solid var(--border-neutral, #ededf0);
        background: var(--bgcolor-neutral-default, #fafafb);
        transition: all 0.2s ease-in-out;

        @media (min-width: 1024px) {
            width: 166px;
        }
        .info {
            position: absolute;
            display: flex;
            flex-direction: column;
            max-height: 40px;
            overflow: hidden;
            opacity: 1;
            transition: opacity 0.2s ease-in-out 0.2s;
            margin-left: var(--base-36, 36px);
        }

        .progressCircle {
            display: flex;
            height: 100%;
            align-items: center;
        }
    }

    .icons .progress-card {
        width: var(--base-32, 32px);
        border-color: transparent;
        background: transparent;
        padding-left: var(--base-4, 4px);
    }

    .divider {
        margin-block-start: var(--space-2, 4px);
        margin-block-end: var(--space-6, 12px);
        width: 100%;
    }

    .bottom {
        @media (min-width: 1024px) {
            height: var(--base-32, 32px);
        }
    }

    :global(button.collapse) {
        transform: translateX(-10px);
    }

    .sub-navigation {
        margin-top: 48px;
        @media (min-width: 1024px) {
            margin-top: 0;
            width: 400px;
            height: calc(100vh - 48px);
            display: flex;
            justify-content: flex-end;
            background-color: var(--bgcolor-neutral-primary, #fff);
            z-index: 14;
            position: fixed;
            top: 48px;
            transition: width 0.2s linear;

            &.icons {
                width: 266px;
                transition: width 0.3s linear;
            }
        }
    }
</style>
