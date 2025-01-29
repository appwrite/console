<script lang="ts">
    import { Step, Link, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { addPlatform } from './platforms/+page.svelte';
    import { app } from '$lib/stores/app';
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
    import Wizard from './keys/wizard.svelte';
    import { wizard } from '$lib/stores/wizard';
    import { onMount } from 'svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    function createKey() {
        wizard.start(Wizard);
    }

    export let projectId: string;
    export let hasPlatforms: boolean;
</script>

<div style:container-type="inline-size">
    <div class="console-container">
        <div class="dashboard-content">
            {#if !hasPlatforms}
                <Step.List>
                    <Step.Item state="previous"
                        ><div>
                            <h2 class="done">Create project</h2>
                        </div></Step.Item>
                    <Step.Item state="current"
                        ><Layout.Stack
                            direction={$isSmallViewport ? 'column' : 'row'}
                            gap={$isSmallViewport ? 'xl' : 'xxl'}>
                            <Layout.Stack gap="m">
                                <h2>Add a platform</h2>
                                <div class="build-info">
                                    <span>
                                        Start building with your preferred web, mobile, and native
                                        frameworks.
                                    </span>
                                </div>
                            </Layout.Stack>
                            <div class="grid">
                                <button
                                    class="onboarding-card platform-card top-row"
                                    on:click={() => addPlatform(0)}>
                                    <Layout.Stack direction="column" justifyContent="space-between">
                                        <img
                                            src={$app.themeInUse === 'dark'
                                                ? PlatformWebImgSourceDark
                                                : PlatformWebImgSource}
                                            alt="" />
                                        <div class="card-content">
                                            <Layout.Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="flex-end">
                                                <h3>Web</h3>

                                                <div class="is-only-desktop">
                                                    <Icon
                                                        icon={IconArrowRight}
                                                        color="--neutral-250" />
                                                </div></Layout.Stack>
                                        </div>
                                    </Layout.Stack>
                                </button>
                                <button
                                    class="onboarding-card platform-card top-row"
                                    on:click={createKey}>
                                    <Layout.Stack direction="column" justifyContent="space-between">
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
                                                    <Icon
                                                        icon={IconArrowRight}
                                                        color="--neutral-250" />
                                                </div></Layout.Stack>
                                        </div>
                                    </Layout.Stack>
                                </button>
                                <button
                                    class="onboarding-card platform-card"
                                    on:click={() => addPlatform(3)}>
                                    <Layout.Stack direction="column" justifyContent="space-between">
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
                                                    <Icon
                                                        icon={IconArrowRight}
                                                        color="--neutral-250" />
                                                </div></Layout.Stack>
                                        </div>
                                    </Layout.Stack>
                                </button>
                                <button
                                    class="onboarding-card platform-card"
                                    on:click={() => addPlatform(2)}>
                                    <Layout.Stack direction="column" justifyContent="space-between">
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
                                                    <Icon
                                                        icon={IconArrowRight}
                                                        color="--neutral-250" />
                                                </div></Layout.Stack>
                                        </div>
                                    </Layout.Stack>
                                </button>

                                <button
                                    class="onboarding-card platform-card"
                                    on:click={() => addPlatform(1)}>
                                    <Layout.Stack direction="column" justifyContent="space-between">
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
                                                    <Icon
                                                        icon={IconArrowRight}
                                                        color="--neutral-250" />
                                                </div></Layout.Stack>
                                        </div>
                                    </Layout.Stack>
                                </button>
                            </div>
                        </Layout.Stack></Step.Item>
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
                        ><Layout.Stack
                            direction={isSmallViewport ? 'column' : 'row'}
                            gap={isSmallViewport ? 'xl' : 'xxl'}>
                            <Layout.Stack gap="m">
                                <h2>Build your app</h2>
                                <div class="build-info">
                                    <span>
                                        Continue building your app by setting up services such as
                                        Auth, Databases, Storage and Functions.</span>
                                </div>
                            </Layout.Stack>
                            <div class="grid">
                                <a
                                    class="onboarding-card build-card"
                                    href={`${base}/project-${projectId}/databases`}>
                                    <Layout.Stack direction="column" justifyContent="space-between">
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
                                                <span class="is-only-desktop">
                                                    <Icon
                                                        icon={IconArrowRight}
                                                        color="--neutral-250" />
                                                </span></Layout.Stack>
                                        </div>
                                    </Layout.Stack>
                                </a>
                                <div class="onboarding-card build-card">
                                    <div class="card-content card-docs">
                                        <Layout.Stack
                                            direction="column"
                                            justifyContent="space-between">
                                            <h3>Discover our docs</h3>
                                            <Layout.Stack
                                                direction="column"
                                                gap="s"
                                                justifyContent="flex-end">
                                                <Link.Anchor
                                                    variant="quiet-muted"
                                                    href="https://appwrite.io/docs/references"
                                                    target="_blank">API references</Link.Anchor>
                                                <Link.Anchor
                                                    variant="quiet-muted"
                                                    href="https://appwrite.io/docs/tutorials"
                                                    target="_blank">Tutorials</Link.Anchor>
                                                <Link.Anchor
                                                    variant="quiet-muted"
                                                    href="https://appwrite.io/docs/products/storage/quick-start"
                                                    target="_blank"
                                                    >Storage quick start
                                                </Link.Anchor>
                                                <Link.Anchor
                                                    variant="quiet-muted"
                                                    href="https://appwrite.io/docs/products/functions/quick-start"
                                                    target="_blank"
                                                    >Functions quick start</Link.Anchor>
                                            </Layout.Stack>
                                        </Layout.Stack>
                                    </div>
                                </div>
                                <div class="onboarding-card card-auth build-card">
                                    <div class="card-content">
                                        <Layout.Stack
                                            direction="column"
                                            justifyContent="space-between">
                                            <h3>Setup auth</h3>
                                            <Layout.Stack
                                                direction="column"
                                                gap="s"
                                                justifyContent="flex-end">
                                                <Link.Anchor
                                                    variant="quiet-muted"
                                                    href={`${base}/project-${projectId}/auth/settings`}
                                                    >E-mail and password
                                                </Link.Anchor>
                                                <Link.Anchor
                                                    variant="quiet-muted"
                                                    href={`${base}/project-${projectId}/auth/settings`}
                                                    >OAuth 2</Link.Anchor>
                                                <Link.Anchor
                                                    variant="quiet-muted"
                                                    href={`${base}/project-${projectId}/auth/settings`}
                                                    >View all methods</Link.Anchor>
                                            </Layout.Stack>
                                        </Layout.Stack>
                                    </div>
                                    <img
                                        src={$app.themeInUse === 'dark'
                                            ? UsersImgSourceDark
                                            : UsersImgSource}
                                        alt="" />
                                </div>
                                <div class="onboarding-card build-card">
                                    <div class="card-content">
                                        <Layout.Stack
                                            direction="column"
                                            justifyContent="space-between">
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
                                                ><Layout.Stack
                                                    direction="row"
                                                    alignItems="flex-end"
                                                    gap="xxs"
                                                    ><span
                                                        >Join our Discord for support, tips and
                                                        product updates</span>
                                                    <span class="is-only-desktop">
                                                        <Icon
                                                            icon={IconArrowRight}
                                                            size="s"
                                                            color="--neutral-250" />
                                                    </span></Layout.Stack
                                                ></Link.Anchor>
                                        </Layout.Stack>
                                    </div>
                                </div>
                            </div>
                        </Layout.Stack></Step.Item>
                </Step.List>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';
    .dashboard-content {
        background: var(--color-bgcolor-neutral-default, #fafafb);

        h2 {
            color: var(--color-fgcolor-neutral-primary, #2d2d31);

            /* Desktop/Title S */
            font-family: var(--font-family-brand, 'Aeonik Pro');
            font-size: var(--font-size-L, 20px);
            font-style: normal;
            font-weight: 400;
            line-height: 130%; /* 26px */
        }

        .top-row img {
            min-height: 145px;
        }

        h2.done {
            color: var(--color-fgcolor-neutral-tertiary, #97979b);
        }

        .build-info {
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
                color: var(--color-fgcolor-neutral-primary, #2d2d31);

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
        }

        :global(.build-card div) {
            height: 100%;
        }

        .card-docs {
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

            .card-content {
                padding-inline-end: 0;
            }

            img {
                height: 160px;
                align-self: flex-end;
            }

            .card-links {
                min-width: 160px;
            }
        }

        .card-links {
            display: flex;
            flex-direction: column;
            gap: var(--space-4);
        }
    }
    .discord {
        width: 24px;
    }
</style>
