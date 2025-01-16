<script lang="ts">
    import { Button, Step, Link, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { app } from '$lib/stores/app';
    import { IconArrowRight } from '@appwrite.io/pink-icons-svelte';
    import DatabaseImgSource from './assets/database.png';
    import DatabaseImgSourceDark from './assets/database-dark.png';
    import UsersImgSource from './assets/users.png';
    import UsersImgSourceDark from './assets/users-dark.png';
    import DiscordImgSource from './assets/discord.png';
    import DiscordImgSourceDark from './assets/discord-dark.png';
    import { base } from '$app/paths';
    import { setHasOnboardingDismissed } from '$lib/helpers/onboarding';
    import { goto } from '$app/navigation';

    export let projectId: string;
</script>

<div class="dashboard-header">
    <div>
        <h1>Welcome, Jacob</h1>
        <span>Follow a few quick steps to get started with Appwrite</span>
    </div>
    <Button.Button
        variant="secondary"
        size="s"
        on:click={() => {
            setHasOnboardingDismissed(projectId);
            goto(`${base}/project-${projectId}`);
        }}>Dismiss this page</Button.Button>
</div>
<div class="dashboard-content">
    <Step.List>
        <Step.Item state="previous"
            ><div>
                <h2 class="done">Create project</h2>
            </div></Step.Item>
        <Step.Item state="previous"
            ><div>
                <h2 class="done">Add a platform</h2>
            </div></Step.Item>
        <Step.Item state="current"
            ><div class="build-container">
                <div class="build-info">
                    <h2>Build your app</h2>
                    <span>
                        Continue building your app by setting up services such as Auth, Databases,
                        Storage and Functions.</span>
                </div>
                <div class="grid">
                    <div class="onboarding-card">
                        <img
                            src={$app.themeInUse == 'dark'
                                ? DatabaseImgSourceDark
                                : DatabaseImgSource}
                            alt="" />
                        <div class="card-content">
                            <Link.Anchor
                                variant="quiet-muted"
                                style="width: 100%"
                                href={`${base}/project-${projectId}/databases`}
                                ><Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <h3>Setup your database</h3>
                                    <Icon icon={IconArrowRight} /></Layout.Stack
                                ></Link.Anchor>
                        </div>
                    </div>
                    <div class="onboarding-card">
                        <div class="card-content card-docs">
                            <h3>Discover our docs</h3>
                            <div class="card-links">
                                <Link.Anchor
                                    variant="quiet-muted"
                                    href="https://appwrite.io/docs/references"
                                    target="_blank"
                                    ><Layout.Stack direction="row" alignItems="center" gap="xxs"
                                        >API references <Icon
                                            icon={IconArrowRight}
                                            size="s" /></Layout.Stack
                                    ></Link.Anchor>
                                <Link.Anchor
                                    variant="quiet-muted"
                                    href="https://appwrite.io/docs/tutorials"
                                    target="_blank"
                                    ><Layout.Stack direction="row" alignItems="center" gap="xxs"
                                        >Tutorials <Icon
                                            icon={IconArrowRight}
                                            size="s" /></Layout.Stack
                                    ></Link.Anchor>
                                <Link.Anchor
                                    variant="quiet-muted"
                                    href="https://appwrite.io/docs/products/storage/quick-start"
                                    target="_blank"
                                    ><Layout.Stack direction="row" alignItems="center" gap="xxs"
                                        >Storage quick start<Icon
                                            icon={IconArrowRight}
                                            size="s" /></Layout.Stack
                                    ></Link.Anchor>
                                <Link.Anchor
                                    variant="quiet-muted"
                                    href="https://appwrite.io/docs/products/functions/quick-start"
                                    target="_blank"
                                    ><Layout.Stack direction="row" alignItems="center" gap="xxs"
                                        >Functions quick start<Icon
                                            icon={IconArrowRight}
                                            size="s" /></Layout.Stack
                                    ></Link.Anchor>
                            </div>
                        </div>
                    </div>
                    <div class="onboarding-card card-auth">
                        <div class="card-content">
                            <h3>Setup auth</h3>
                            <div class="card-links">
                                <Link.Anchor
                                    variant="quiet-muted"
                                    href={`${base}/project-${projectId}/auth/settings`}
                                    ><Layout.Stack direction="row" alignItems="center" gap="xxs"
                                        >E-mail and password<Icon
                                            icon={IconArrowRight}
                                            size="s" /></Layout.Stack
                                    ></Link.Anchor>
                                <Link.Anchor
                                    variant="quiet-muted"
                                    href={`${base}/project-${projectId}/auth/settings`}
                                    ><Layout.Stack direction="row" alignItems="center" gap="xxs"
                                        >OAuth 2<Icon
                                            icon={IconArrowRight}
                                            size="s" /></Layout.Stack
                                    ></Link.Anchor>
                                <Link.Anchor
                                    variant="quiet-muted"
                                    href={`${base}/project-${projectId}/auth/settings`}
                                    ><Layout.Stack direction="row" alignItems="center" gap="xxs"
                                        >View all methods<Icon
                                            icon={IconArrowRight}
                                            size="s" /></Layout.Stack
                                    ></Link.Anchor>
                            </div>
                        </div>
                        <img
                            src={$app.themeInUse == 'dark' ? UsersImgSourceDark : UsersImgSource}
                            alt="" />
                    </div>
                    <div class="onboarding-card">
                        <div class="card-content">
                            <img
                                src={$app.themeInUse == 'dark'
                                    ? DiscordImgSourceDark
                                    : DiscordImgSource}
                                class="discord"
                                alt="" />
                            <h3>Discord</h3>
                            <Link.Anchor
                                variant="quiet-muted"
                                href="https://appwrite.io/discord"
                                size="l"
                                ><Layout.Stack direction="row" alignItems="flex-end" gap="xxs"
                                    >Join our Discord for support, tips and product updates
                                    <div style:flex-shrink="0">
                                        <Icon icon={IconArrowRight} size="s" />
                                    </div></Layout.Stack
                                ></Link.Anchor>
                        </div>
                    </div>
                </div>
            </div></Step.Item>
    </Step.List>
</div>

<style lang="scss">
    .dashboard-header {
        width: 100%;
        border-bottom: 1px solid var(--color-border-neutral, #ededf0);
        background: var(--color-bgcolor-neutral-primary, #fff);
        gap: var(--space-7, 16px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

        padding: var(--space-7, 16px);

        @media (min-width: 768px) {
            padding-inline: 55px;
            padding-block: var(--base-40);
            flex-direction: row;
            gap: 0;
        }

        h1 {
            color: var(--color-fgcolor-neutral-primary, #2d2d31);

            /* Desktop/Title XL */
            font-family: var(--font-family-brand, 'Aeonik Pro');
            font-size: var(--font-size-xxxl, 32px);
            font-style: normal;
            font-weight: 400;
            line-height: 140%; /* 44.8px */
            letter-spacing: -0.144px;
            margin-block: 6px;
        }

        span {
            color: var(--color-fgcolor-neutral-secondary, #56565c);

            /* Desktop/Body L 400 */
            font-family: var(--font-family-sansserif, Inter);
            font-size: var(--font-size-m, 16px);
            font-style: normal;
            font-weight: 400;
            line-height: 140%; /* 22.4px */
            letter-spacing: -0.16px;
        }
    }

    .dashboard-content {
        background: var(--color-bgcolor-neutral-default, #fafafb);
        padding: 0 var(--space-7, 16px) var(--space-7, 16px) var(--space-7, 16px);

        @media (min-width: 768px) {
            padding-inline: 55px;
            padding-block: var(--base-40);
        }

        h2 {
            color: var(--color-fgcolor-neutral-primary, #2d2d31);

            /* Desktop/Title S */
            font-family: var(--font-family-brand, 'Aeonik Pro');
            font-size: var(--font-size-L, 20px);
            font-style: normal;
            font-weight: 400;
            line-height: 130%; /* 26px */
        }

        h2.done {
            color: var(--color-fgcolor-neutral-tertiary, #97979b);
        }

        .build-container {
            display: flex;
            flex-direction: column;
            gap: var(--space-6);

            @media (min-width: 768px) {
                flex-direction: row;
                gap: var(--space-13);
            }

            .build-info {
                display: flex;
                flex-direction: column;
                gap: var(--space-7);
                span {
                    color: var(--color-fgcolor-neutral-secondary, #56565c);

                    /* Desktop/Body M 400 */
                    font-family: var(--font-family-sansserif, Inter);
                    font-size: var(--font-size-S, 14px);
                    font-style: normal;
                    font-weight: 400;
                    line-height: 140%; /* 19.6px */
                    letter-spacing: -0.063px;
                }
            }

            .onboarding-card {
                border-radius: 8px;
                border: 1px solid var(--color-border-neutral, #ededf0);
                background: var(--color-bgcolor-neutral-primary, #fff);

                h3 {
                    color: var(--color-fgcolor-neutral-secondary, #56565c);

                    /* Desktop/Title S */
                    font-family: var(--font-family-brand, 'Aeonik Pro');
                    font-size: var(--font-size-l, 20px);
                    font-style: normal;
                    font-weight: 400;
                    line-height: 130%; /* 26px */
                }
            }

            .grid {
                display: grid;
                gap: var(--space-7);
                @media (min-width: 768px) {
                    grid-template-columns: repeat(6, 1fr);
                    grid-template-rows: auto auto;

                    .onboarding-card:nth-child(1) {
                        grid-column: span 3;
                    }

                    .onboarding-card:nth-child(2) {
                        grid-column: span 3;
                    }

                    .onboarding-card:nth-child(3) {
                        grid-column: span 4;
                    }

                    .onboarding-card:nth-child(4) {
                        grid-column: span 2;
                    }
                }
            }

            .card-content {
                padding: 24px;
                height: 100%;
                display: flex;
                flex-direction: column;

                h3 {
                    margin-block-end: var(--space-4);

                    @media (min-width: 768px) {
                        margin-block-end: auto;
                    }
                }
            }

            .card-docs {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;
            }

            .card-auth {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                overflow: hidden;

                img {
                    height: 160px;
                    margin-top: var(--space-7);
                }

                .card-links {
                    min-width: 200px;
                }
            }

            .card-links {
                display: flex;
                flex-direction: column;
                gap: var(--space-4);
            }
        }
    }
    .discord {
        width: 24px;
    }
</style>
