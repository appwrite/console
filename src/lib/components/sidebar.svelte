<script lang="ts">
    import {
        Icon,
        Sidebar,
        ProgressCircle,
        Tooltip,
        Divider,
        Link,
        Button,
        Layout
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
    import { Feedback } from '$lib/components/feedback';
    import type { ComponentType } from 'svelte';

    type $$Props = HTMLElement & {
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

    export let state: $$Props['state'] = 'closed';
    export let project: $$Props['project'];
    export let avatar: $$Props['avatar'];
    export let progressCard: $$Props['progressCard'] = undefined;
    export let sideBarIsOpen: boolean;
    export let showAccountMenu: boolean;
    export let subNavigation = undefined;

    function toggleFeedback() {
        feedback.toggleFeedback();
        if ($feedback.notification) {
            feedback.toggleNotification();
            feedback.addVisualization();
        }
    }

    const projectOptions = [
        { name: 'Auth', icon: IconUserGroup, slug: 'auth' },
        { name: 'Databases', icon: IconDatabase, slug: 'databases' },
        { name: 'Functions', icon: IconLightningBolt, slug: 'functions' },
        { name: 'Messaging', icon: IconChatBubble, slug: 'messaging' },
        { name: 'Sites', icon: IconGlobeAlt, slug: 'sites' },
        { name: 'Storage', icon: IconFolder, slug: 'storage' }
    ];
</script>

<div class:only-mobile={project === undefined}>
    <Sidebar.Base {...$$props} bind:state resizable={subNavigation === undefined}>
        <div slot="top">
            <div class="only-mobile top">
                <div class="icons">
                    <Link.Button
                        variant="quiet-muted"
                        on:click={() => {
                            toggleCommandCenter();
                            state = 'closed';
                            sideBarIsOpen = false;
                        }}>
                        <div class="icon"><Icon icon={IconSearch} /></div></Link.Button>
                </div>
                <Link.Button
                    on:click={() => {
                        showAccountMenu = !showAccountMenu;
                    }}><img src={avatar} alt={'Avatar'} class="avatar" /></Link.Button>
            </div>
        </div>
        <div slot="middle" class:icons={state === 'icons'}>
            {#if progressCard}
                <Tooltip inline={false} placement="right" disabled={state !== 'icons'}>
                    <a
                        class="progress-card"
                        href={`/console/project-${project.$id}/get-started`}
                        on:click={() => {
                            sideBarIsOpen = false;
                        }}>
                        <ProgressCircle size="s" progress={progressCard.percentage} />
                        <div class="info" class:no-text={state === 'icons'}>
                            <span class="title">{progressCard.title}</span>
                            <span class="description">{progressCard.percentage}% complete</span>
                        </div>
                    </a>
                    <span slot="tooltip">Getting started</span>
                </Tooltip>
            {/if}
            {#if project}<Layout.Stack direction="column" gap="s">
                    <Tooltip inline={false} placement="right" disabled={state !== 'icons'}>
                        <a
                            href={`/console/project-${project.$id}?getStarted=false`}
                            class="link"
                            on:click={() => {
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
                    <div class="only-mobile divider"><Divider /></div>
                    <div class="products-label-container">
                        <span class="products-label" class:hidden={state === 'icons'}
                            >Products</span>
                        <span class="products-label-indicator" class:hidden={state !== 'icons'}
                        ></span>
                    </div>
                    {#each projectOptions as projectOption}
                        <Tooltip inline={false} placement="right" disabled={state !== 'icons'}>
                            <a
                                href={`/console/project-${project.$id}/${projectOption.slug}`}
                                class="link"
                                on:click={() => {
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
                        <Tooltip inline={false} placement="right" disabled={state !== 'icons'}>
                            <a href={`/console/project-${project.$id}/settings`} class="link"
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
                        <DropList show={$feedback.show} scrollable on:blur={toggleFeedback}>
                            <Button.Button variant="secondary" size="s" on:click={toggleFeedback}
                                >Feedback</Button.Button>
                            <svelte:fragment slot="other">
                                <Feedback />
                            </svelte:fragment>
                        </DropList>
                        <Button.Button variant="secondary" size="s"
                            ><span>Support</span></Button.Button>
                    </Layout.Stack>
                </div>
            {/if}
        </div>
        <div slot="bottom" class="bottom" class:icons={state === 'icons'}>
            {#if project}
                <div class="only-desktop">
                    <Tooltip inline={false} placement="right" disabled={state !== 'icons'}>
                        <a href={`/console/project-${project.$id}/settings`} class="link"
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
                            <DropList show={$feedback.show} scrollable on:blur={toggleFeedback}>
                                <Button.Button
                                    variant="secondary"
                                    size="s"
                                    on:click={toggleFeedback}>Feedback</Button.Button>
                                <svelte:fragment slot="other">
                                    <Feedback />
                                </svelte:fragment>
                            </DropList>
                            <Button.Button variant="secondary" size="s"
                                ><span>Support</span></Button.Button>
                        </Layout.Stack>
                    </div>
                </div>
            {/if}
        </div>
    </Sidebar.Base>
</div>

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
            color: var(--color-fgcolor-neutral-weak);
            transition: color 0.2s ease-in-out;
        }

        &:hover {
            background: var(--color-bgcolor-neutral-secondary, #f4f4f7);
            .link-icon {
                color: var(--color-fgcolor-neutral-tertiary);
            }
        }

        &:focus-visible {
            background: var(--color-bgcolor-neutral-secondary, #f4f4f7);

            /* box-shadow/state/focus */
            box-shadow:
                var(--shadow-offsetx-0, 0px) var(--shadow-offsety-0, 0px) 0 2px
                    var(--color-bgcolor-neutral-default, #fafafb),
                0px 0px 0px 4px var(--color-border-focus, #818186);
        }

        &:active {
            background: var(--color-bgcolor-neutral-secondary, #f4f4f7);
            .link-text {
                color: var(--color-fgcolor-neutral-primary);
            }
            .link-icon {
                color: var(--color-fgcolor-neutral-primary);
            }
        }
    }

    .icons .link {
        gap: 0;
    }

    .link-text {
        width: 128px;
        transition: all 0.2s ease-in-out;
        transition-behavior: allow-discrete;
        opacity: 1;
        visibility: visible;
        color: var(--color-fgcolor-neutral-secondary, #56565c);
        &.no-text {
            visibility: hidden;
            opacity: 0;
            width: 0;
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
    .avatar {
        width: 32px;
        aspect-ratio: 1 /1;
        border-radius: var(--border-radius-circle, 99999px);
    }

    .top {
        display: flex;
        width: 199px;
        max-height: 48px;
        padding: var(--space-4, 8px) var(--space-7, 16px) var(--space-4, 8px) var(--space-7, 16px);
        margin-left: calc(-1 * var(--space-7, 16px));
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--gap-s, 8px);

        border-bottom: var(--border-width-s, 1px) solid var(--color-border-neutral, #ededf0);
        background: var(--color-bgcolor-neutral-primary, #fff);

        .icon {
            display: flex;
            padding: var(--space-3, 6px);
            justify-content: center;
            align-items: center;

            color: var(--color-fgcolor-neutral-weak);
        }
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
        margin-block-start: var(--base-32, 32px);
        margin-block-end: var(--base-8, 8px);
    }
    .products-label {
        font-size: var(--font-size-xs);
        color: var(--color-fgcolor-neutral-tertiary);
    }
    .products-label-indicator {
        border-bottom: 1px solid var(--color-border-neutral);
        height: 1px;
        width: 18px;
        align-self: center;
        margin-inline: 8px;
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
        .only-mobile {
            display: none;
        }
        .only-desktop {
            display: inline;
        }
    }

    .progress-card {
        width: 170px;
        height: 60px;
        display: flex;
        padding: 8px;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: var(--space-5, 10px);
        margin-block-end: var(--space-6, 12px);
        align-self: stretch;
        border-radius: var(--border-radius-s, 8px);
        border: 1px solid var(--color-border-neutral, #ededf0);
        background: var(--color-bgcolor-neutral-default, #fafafb);
        transition: all 0.2s ease-in-out;

        .info {
            display: flex;
            flex-direction: column;
            max-height: 40px;
            overflow: hidden;
        }

        .no-text {
            display: none;
        }

        .title {
            color: var(--color-fgcolor-neutral-secondary, #56565c);

            font-size: var(--font-size-s, 14px);
            font-style: normal;
            font-weight: 600;
            line-height: 140%; /* 19.6px */
            letter-spacing: -0.063px;
        }

        .description {
            color: var(--color-fgcolor-neutral-secondary, #56565c);

            /* Desktop/Body M 400 */
            font-size: var(--font-size-s, 14px);
            font-style: normal;
            font-weight: 400;
            line-height: 140%; /* 19.6px */
            letter-spacing: -0.063px;
        }
    }

    .icons .progress-card {
        width: var(--base-32, 32px);
        border-color: transparent;
        background: transparent;
    }

    .divider {
        margin-block: var(--space-2, 4px);
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
</style>
