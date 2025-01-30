<script lang="ts">
    import { Step, Link, Icon, Layout, Card, Typography } from '@appwrite.io/pink-svelte';
    import { addPlatform } from './platforms/+page.svelte';
    import { app } from '$lib/stores/app';
    import { IconArrowRight } from '@appwrite.io/pink-icons-svelte';
    import DatabaseImgSource from './assets/database.png';
    import DatabaseImgSourceDark from './assets/database-dark.png';
    import UsersImgSource from './assets/users.svg';
    import UsersImgSourceDark from './assets/users-dark.svg';
    import DiscordImgSource from './assets/discord.png';
    import DiscordImgSourceDark from './assets/discord-dark.png';
    import PlatformWebImgSource from './assets/platform-web.png';
    import PlatformWebImgSourceDark from './assets/platform-web-dark.png';
    import PlatformServerImgSource from './assets/platform-server.png';
    import PlatformServerImgSourceDark from './assets/platform-server-dark.png';
    import PlatformIosImgSource from './assets/platform-ios.svg';
    import PlatformIosImgSourceDark from './assets/platform-ios-dark.svg';
    import PlatformAndroidImgSource from './assets/platform-android.svg';
    import PlatformAndroidImgSourceDark from './assets/platform-android-dark.svg';
    import PlatformFlutterImgSource from './assets/platform-flutter.svg';
    import PlatformFlutterImgSourceDark from './assets/platform-flutter-dark.svg';
    import { base } from '$app/paths';
    import Wizard from './keys/wizard.svelte';
    import { wizard } from '$lib/stores/wizard';
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
                            <Typography.Title color="--color-fgcolor-neutral-tertiary" size="s"
                                >Create project</Typography.Title>
                        </div></Step.Item>
                    <Step.Item state="current">
                        <Layout.Stack
                            direction={$isSmallViewport ? 'column' : 'row'}
                            gap={$isSmallViewport ? 'xl' : 'xxl'}>
                            <div class="step-info">
                                <Layout.Stack gap="m">
                                    <Typography.Title
                                        color="--color-fgcolor-neutral-primary"
                                        size="s">Add a platform</Typography.Title>
                                    <div class="build-info">
                                        <span>
                                            Start building with your preferred web, mobile, and
                                            native frameworks.
                                        </span>
                                    </div>
                                </Layout.Stack>
                            </div>
                            <Layout.Stack gap="l">
                                <Layout.Stack gap="l" direction="row">
                                    <Card.Button on:click={() => addPlatform(0)}
                                        ><Layout.Stack gap="xl"
                                            ><div
                                                class="card-top-image"
                                                style:background-image={`url('${
                                                    $app.themeInUse === 'dark'
                                                        ? PlatformWebImgSourceDark
                                                        : PlatformWebImgSource
                                                }')`}>
                                            </div>
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s">Web</Typography.Title>
                                                <div class="arrow-icon">
                                                    <Icon icon={IconArrowRight} size="s" />
                                                </div>
                                            </Layout.Stack>
                                        </Layout.Stack></Card.Button>
                                    <Card.Button on:click={createKey}
                                        ><Layout.Stack gap="xl"
                                            ><div
                                                class="card-top-image"
                                                style:background-image={`url('${
                                                    $app.themeInUse === 'dark'
                                                        ? PlatformServerImgSourceDark
                                                        : PlatformServerImgSource
                                                }')`}>
                                            </div>
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s">Server</Typography.Title>
                                                <div class="arrow-icon">
                                                    <Icon icon={IconArrowRight} size="s" />
                                                </div>
                                            </Layout.Stack>
                                        </Layout.Stack></Card.Button>
                                </Layout.Stack>
                                <Layout.Stack gap="l" direction="row">
                                    <Card.Button on:click={() => addPlatform(3)}>
                                        <Layout.Stack gap="xxl">
                                            <img
                                                class="platform-image"
                                                src={$app.themeInUse === 'dark'
                                                    ? PlatformIosImgSourceDark
                                                    : PlatformIosImgSource}
                                                alt="" />
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s">Apple</Typography.Title>
                                                <div class="arrow-icon">
                                                    <Icon icon={IconArrowRight} size="s" />
                                                </div></Layout.Stack>
                                        </Layout.Stack>
                                    </Card.Button>
                                    <Card.Button on:click={() => addPlatform(2)}>
                                        <Layout.Stack gap="xxl">
                                            <img
                                                class="platform-image"
                                                src={$app.themeInUse === 'dark'
                                                    ? PlatformAndroidImgSourceDark
                                                    : PlatformAndroidImgSource}
                                                alt="" />
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s"
                                                    >Android</Typography.Title>
                                                <div class="arrow-icon">
                                                    <Icon icon={IconArrowRight} size="s" />
                                                </div></Layout.Stack>
                                        </Layout.Stack>
                                    </Card.Button>
                                    <Card.Button on:click={() => addPlatform(1)}>
                                        <Layout.Stack gap="xxl">
                                            <img
                                                class="platform-image"
                                                src={$app.themeInUse === 'dark'
                                                    ? PlatformFlutterImgSourceDark
                                                    : PlatformFlutterImgSource}
                                                alt="" />
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s"
                                                    >Flutter</Typography.Title>
                                                <div class="arrow-icon">
                                                    <Icon icon={IconArrowRight} size="s" />
                                                </div></Layout.Stack>
                                        </Layout.Stack>
                                    </Card.Button>
                                </Layout.Stack>
                            </Layout.Stack>
                        </Layout.Stack></Step.Item>
                    <Step.Item state="next"
                        ><div>
                            <Typography.Title color="--color-fgcolor-neutral-tertiary" size="s"
                                >Build your app</Typography.Title>
                        </div></Step.Item>
                </Step.List>
            {:else}
                <Step.List>
                    <Step.Item state="previous"
                        ><div>
                            <Typography.Title color="--color-fgcolor-neutral-tertiary" size="s"
                                >Create project</Typography.Title>
                        </div></Step.Item>
                    <Step.Item state="previous"
                        ><div>
                            <Typography.Title color="--color-fgcolor-neutral-tertiary" size="s"
                                >Add a platform</Typography.Title>
                        </div></Step.Item>
                    <Step.Item state="current">
                        <Layout.Stack
                            direction={$isSmallViewport ? 'column' : 'row'}
                            gap={$isSmallViewport ? 'xl' : 'xxl'}>
                            <div class="step-info">
                                <Layout.Stack gap="m">
                                    <Typography.Title
                                        color="--color-fgcolor-neutral-primary"
                                        size="s">Build your app</Typography.Title>
                                    <div class="build-info">
                                        <span>
                                            Continue building your app by setting up services such
                                            as Auth, Databases, Storage and Functions.
                                        </span>
                                    </div>
                                </Layout.Stack>
                            </div>
                            <Layout.Stack gap="l">
                                <Layout.Stack
                                    gap="l"
                                    direction={$isSmallViewport ? 'column' : 'row'}>
                                    <Card.Button on:click={() => addPlatform(0)}
                                        ><Layout.Stack gap="xl"
                                            ><div
                                                class="card-top-image database-card-image"
                                                style:background-image={`url('${
                                                    $app.themeInUse === 'dark'
                                                        ? DatabaseImgSourceDark
                                                        : DatabaseImgSource
                                                }')`}>
                                            </div>
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s"
                                                    >Set up your database</Typography.Title>
                                                <div class="arrow-icon">
                                                    <Icon icon={IconArrowRight} size="s" />
                                                </div>
                                            </Layout.Stack>
                                        </Layout.Stack></Card.Button>
                                    <Card.Base
                                        ><div class="full-height-card">
                                            <Layout.Stack gap="xl" justifyContent="space-between">
                                                <Typography.Title size="s"
                                                    >Discover our docs</Typography.Title>
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
                                        </div></Card.Base>
                                </Layout.Stack>
                                <Layout.Stack
                                    gap="l"
                                    direction={$isSmallViewport ? 'column' : 'row'}>
                                    <div class="double-width-card">
                                        <Card.Base
                                            ><div class="full-height-card">
                                                <Layout.Stack direction="row">
                                                    <Layout.Stack
                                                        gap="xl"
                                                        justifyContent="space-between">
                                                        <Typography.Title size="s"
                                                            >Set up Auth</Typography.Title>
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
                                                    <div
                                                        class="auth-image"
                                                        style:background-image={`url('${
                                                            $app.themeInUse === 'dark'
                                                                ? UsersImgSourceDark
                                                                : UsersImgSource
                                                        }')`} />
                                                </Layout.Stack>
                                            </div></Card.Base>
                                    </div>

                                    <Card.Link href="https://appwrite.io/discord">
                                        <div class="full-height-card">
                                            <Layout.Stack gap="xs" justifyContent="space-between">
                                                <Layout.Stack direction="column" gap="xxxs">
                                                    <img
                                                        src={$app.themeInUse === 'dark'
                                                            ? DiscordImgSourceDark
                                                            : DiscordImgSource}
                                                        class="discord"
                                                        alt="" />
                                                    <Typography.Title size="s"
                                                        >Discord</Typography.Title>
                                                </Layout.Stack>
                                                <Layout.Stack
                                                    direction="row"
                                                    alignItems="flex-end"
                                                    justifyContent="space-between">
                                                    <Typography.Text
                                                        size="m"
                                                        color="--color-fgcolor-neutral-secondary">
                                                        Join our Discord for support, tips and
                                                        product updatese</Typography.Text>
                                                    <div class="arrow-icon arrow-icon-discord">
                                                        <Icon icon={IconArrowRight} size="s" />
                                                    </div>
                                                </Layout.Stack>
                                            </Layout.Stack>
                                        </div>
                                    </Card.Link>
                                </Layout.Stack>
                            </Layout.Stack>
                        </Layout.Stack></Step.Item>
                </Step.List>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';
    .dashboard-content {
        .card-top-image {
            margin-top: calc(-1 * var(--base-24, 24px));
            margin-left: calc(-1 * var(--base-24, 24px));
            width: calc(100% + var(--base-48, 48px));
            height: 187px;
            background-size: cover;
            background-position: center;
        }

        .database-card-image {
            background-size: cover;
            background-position: bottom;
            background-repeat: no-repeat;

            @media (min-width: 768px) {
                background-size: contain;
                background-position: top;
                background-repeat: no-repeat;
            }
        }
        .full-height-card {
            height: 100%;
        }

        .auth-image {
            width: 100%;
            height: 200px;
            margin-right: calc(-1 * var(--base-24, 24px));
            margin-bottom: calc(-1 * var(--base-24, 24px));
            align-self: flex-end;
            background-size: cover;
            background-position: left bottom;
            background-repeat: no-repeat;
        }
        :global(.full-height-card div) {
            height: 100%;
        }

        .double-width-card {
            @media (min-width: 768px) {
                width: 250%;
            }
        }

        .arrow-icon {
            color: var(--color-border-neutral-strong);
            display: none;
            @media (min-width: 768px) {
                display: flex;
            }
        }
        .arrow-icon-discord {
            align-items: flex-end;
        }

        .platform-image {
            width: 56px;
            margin-left: calc(-1 * var(--base-4, 4px));
        }

        .step-info {
            @media (min-width: 768px) {
                max-width: 100px;
            }
            @media (min-width: 1024px) {
                max-width: 200px;
            }
            @media (min-width: 1400px) {
                max-width: 300px;
            }
        }
    }
    .discord {
        width: 24px;
    }
</style>
