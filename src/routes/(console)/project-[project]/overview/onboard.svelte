<script lang="ts">
    import { Button, Step, Link, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { addPlatform } from './platforms/+page.svelte';
    import { app } from '$lib/stores/app';
    import { user } from '$lib/stores/user';
    import { IconArrowRight } from '@appwrite.io/pink-icons-svelte';
    import DatabaseImgSource from './assets/database.png';
    import DatabaseImgSourceDark from './assets/database-dark.png';
    import UsersImgSource from './assets/users.png';
    import UsersImgSourceDark from './assets/users-dark.png';
    import DiscordImgSource from './assets/discord.png';
    import DiscordImgSourceDark from './assets/discord-dark.png';
    import PlatformWebImgSource from './assets/platform-web.png';
    import PlatformWebImgSourceDark from './assets/platform-web-dark.png';
    import PlatformServerImgSource from './assets/platform-server.png';
    import PlatformServerImgSourceDark from './assets/platform-server-dark.png';
    import PlatformIosImgSource from './assets/platform-ios.png';
    import PlatformIosImgSourceDark from './assets/platform-ios-dark.png';
    import PlatformAndroidImgSource from './assets/platform-android.png';
    import PlatformAndroidImgSourceDark from './assets/platform-android-dark.png';
    import PlatformFlutterImgSource from './assets/platform-flutter.png';
    import PlatformFlutterImgSourceDark from './assets/platform-flutter-dark.png';
    import { base } from '$app/paths';
    import { hasOnboardingDismissed, setHasOnboardingDismissed } from '$lib/helpers/onboarding';
    import Wizard from './keys/wizard.svelte';
    import { wizard } from '$lib/stores/wizard';
    import { goto } from '$app/navigation';

    function createKey() {
        wizard.start(Wizard);
    }

    export let projectId: string;
    export let hasPlatforms: boolean;
</script>

<div class="dashboard-header">
    <div>
        <h1>Welcome, {$user.name}</h1>
        <span>Follow a few quick steps to get started with Appwrite</span>
    </div>
    <div class="dashboard-header-button">
        {#if !hasOnboardingDismissed(projectId)}
            <Button.Button
                variant="secondary"
                size="s"
                on:click={() => {
                    setHasOnboardingDismissed(projectId);
                    if (location.href.endsWith('get-started')) {
                        goto(`${base}/project-${projectId}`);
                    } else {
                        location.reload();
                    }
                }}>Dismiss this page</Button.Button>
        {/if}
    </div>
</div>
<div class="dashboard-content">
    {#if !hasPlatforms}
        <Step.List>
            <Step.Item state="previous"
                ><div>
                    <h2 class="done">Create project</h2>
                </div></Step.Item>
            <Step.Item state="current"
                ><div class="build-container">
                    <div class="build-info">
                        <h2>Add a platform</h2>
                        <span>
                            Start building with your preferred web, mobile, and native frameworks.
                        </span>
                    </div>
                    <div class="grid">
                        <button
                            class="onboarding-card platform-card"
                            on:click={() => {
                                // TODO: @ernst web starter > sites websites/starter flow
                            }}>
                            <img
                                src={$app.themeInUse === 'dark'
                                    ? PlatformWebImgSourceDark
                                    : PlatformWebImgSource}
                                alt="" />
                            <div class="card-content">
                                <Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <h3>Web</h3>
                                    <div class="is-only-desktop">
                                        <Icon icon={IconArrowRight} />
                                    </div></Layout.Stack>
                            </div>
                        </button>
                        <button class="onboarding-card platform-card" on:click={createKey}>
                            <img
                                src={$app.themeInUse === 'dark'
                                    ? PlatformServerImgSourceDark
                                    : PlatformServerImgSource}
                                alt="" />
                            <div class="card-content">
                                <Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <h3>Server</h3>
                                    <div class="is-only-desktop">
                                        <Icon icon={IconArrowRight} />
                                    </div></Layout.Stack>
                            </div>
                        </button>
                        <button
                            class="onboarding-card platform-card"
                            on:click={() => addPlatform(3)}>
                            <img
                                src={$app.themeInUse === 'dark'
                                    ? PlatformIosImgSourceDark
                                    : PlatformIosImgSource}
                                alt="" />
                            <div class="card-content">
                                <Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <h3>Apple</h3>
                                    <div class="is-only-desktop">
                                        <Icon icon={IconArrowRight} />
                                    </div></Layout.Stack>
                            </div>
                        </button>
                        <button
                            class="onboarding-card platform-card"
                            on:click={() => addPlatform(2)}>
                            <img
                                src={$app.themeInUse === 'dark'
                                    ? PlatformAndroidImgSourceDark
                                    : PlatformAndroidImgSource}
                                alt="" />
                            <div class="card-content">
                                <Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <h3>Android</h3>
                                    <div class="is-only-desktop">
                                        <Icon icon={IconArrowRight} />
                                    </div></Layout.Stack>
                            </div>
                        </button>

                        <button
                            class="onboarding-card platform-card"
                            on:click={() => addPlatform(1)}>
                            <img
                                src={$app.themeInUse === 'dark'
                                    ? PlatformFlutterImgSourceDark
                                    : PlatformFlutterImgSource}
                                alt="" />
                            <div class="card-content">
                                <Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <h3>Flutter</h3>
                                    <div class="is-only-desktop">
                                        <Icon icon={IconArrowRight} />
                                    </div></Layout.Stack>
                            </div>
                        </button>
                    </div>
                </div></Step.Item>
            <Step.Item state="next"
                ><div>
                    <h2 class="done">Build your app</h2>
                </div></Step.Item>
        </Step.List>
    {:else}
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
                            Continue building your app by setting up services such as Auth,
                            Databases, Storage and Functions.</span>
                    </div>
                    <div class="grid">
                        <a
                            class="onboarding-card build-card"
                            href={`${base}/project-${projectId}/databases`}>
                            <img
                                src={$app.themeInUse === 'dark'
                                    ? DatabaseImgSourceDark
                                    : DatabaseImgSource}
                                alt="" />
                            <div class="card-content">
                                <Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <h3>Setup your database</h3>
                                    <div class="is-only-desktop">
                                        <Icon icon={IconArrowRight} />
                                    </div></Layout.Stack>
                            </div>
                        </a>
                        <div class="onboarding-card build-card">
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
                        <div class="onboarding-card card-auth build-card">
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
                                src={$app.themeInUse === 'dark'
                                    ? UsersImgSourceDark
                                    : UsersImgSource}
                                alt="" />
                        </div>
                        <div class="onboarding-card build-card">
                            <div class="card-content">
                                <img
                                    src={$app.themeInUse === 'dark'
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
                                        <div style:flex-shrink="0" class="is-only-desktop">
                                            <Icon icon={IconArrowRight} size="s" />
                                        </div></Layout.Stack
                                    ></Link.Anchor>
                            </div>
                        </div>
                    </div>
                </div></Step.Item>
        </Step.List>
    {/if}
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

        padding: var(--base-36, 36px) var(--space-7, 16px) var(--base-24, 24px) var(--space-7, 16px);

        @media (min-width: 768px) {
            padding-inline: 55px;
            padding-block: var(--base-40);
            flex-direction: row;
            gap: 0;
        }

        &-button {
            align-self: start;
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
        padding: var(--space-7, 16px);

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
            justify-content: space-between;
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

                @media (min-width: 768px) and (max-width: 1400px) {
                    width: 200px;
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
                    max-width: 776px;

                    .build-card:nth-child(1) {
                        grid-column: span 3;
                        img {
                            max-height: 160px;
                        }
                    }

                    .build-card:nth-child(2) {
                        grid-column: span 3;
                    }

                    .build-card:nth-child(3) {
                        grid-column: span 4;
                    }

                    .build-card:nth-child(4) {
                        grid-column: span 2;
                    }

                    .platform-card:nth-child(1) {
                        grid-column: span 3;
                        img {
                            max-height: 295px;
                        }
                    }
                    .platform-card:nth-child(2) {
                        grid-column: span 3;
                        img {
                            max-height: 295px;
                        }
                    }
                    .platform-card:nth-child(3) {
                        grid-column: span 2;
                        img {
                            max-height: 195px;
                        }
                    }
                    .platform-card:nth-child(4) {
                        grid-column: span 2;
                        img {
                            max-height: 195px;
                        }
                    }
                    .platform-card:nth-child(5) {
                        grid-column: span 2;
                        img {
                            max-height: 195px;
                        }
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
                min-height: 240px;
                @media (min-width: 768px) {
                    height: 100%;
                    min-height: auto;
                }
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
