<script lang="ts">
    import {
        Step,
        Link,
        Icon,
        Layout,
        Card,
        Typography,
        Badge,
        ProgressCircle,
        Button
    } from '@appwrite.io/pink-svelte';
    import { addPlatform, continuePlatform } from './platforms/+page.svelte';
    import { app } from '$lib/stores/app';
    import {
        IconArrowRight,
        IconNodeJs,
        IconPhp,
        IconPython
    } from '@appwrite.io/pink-icons-svelte';
    import DatabaseImgSource from './assets/database.png';
    import DatabaseImgSourceDark from './assets/database-dark.png';
    import UsersImgSource from './assets/users.svg';
    import UsersImgSourceDark from './assets/users-dark.svg';
    import DiscordImgSource from './assets/discord.png';
    import DiscordImgSourceDark from './assets/discord-dark.png';
    import PlatformIosImgSource from './assets/platform-ios.svg';
    import PlatformIosImgSourceDark from './assets/platform-ios-dark.svg';
    import PlatformAndroidImgSource from './assets/platform-android.svg';
    import PlatformAndroidImgSourceDark from './assets/platform-android-dark.svg';
    import PlatformFlutterImgSource from './assets/platform-flutter.svg';
    import PlatformFlutterImgSourceDark from './assets/platform-flutter-dark.svg';
    import { base } from '$app/paths';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { AvatarGroup } from '$lib/components';
    import type { Models } from '@appwrite.io/console';
    import { getPlatformInfo } from '$lib/helpers/platform';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { goto } from '$app/navigation';

    function createKey() {
        trackEvent(Click.KeyCreateClick, {
            source: 'onboarding'
        });
        goto(`${base}/project-${projectId}/overview/keys/create`, {
            replaceState: true
        });
    }

    export let projectId: string;
    export let platforms: Models.Platform[] = [];
    export let pingCount = 0;

    function openPlatformWizard(type: number, platform?: Models.Platform) {
        if (platform) {
            continuePlatform(type, platform.name, platform.key, platform.type);
        } else {
            trackEvent(Click.PlatformCreateClick, { source: 'onboarding' });
            addPlatform(type);
        }
    }

    let platformMap = new Map();

    $: {
        let updatedMap = new Map();
        platforms.forEach((platform) => {
            const platformInfo = getPlatformInfo(platform.type);
            updatedMap.set(platformInfo.name, platform);
        });
        platformMap = updatedMap;
    }
</script>

<div style:container-type="inline-size">
    <div class="console-container">
        <div class="dashboard-content">
            {#if platforms.length === 0 || pingCount === 0}
                <Step.List>
                    <Step.Item state="previous"
                        ><div>
                            <Typography.Title color="--fgcolor-neutral-tertiary" size="s"
                                >Create project</Typography.Title>
                        </div></Step.Item>
                    <Step.Item state="current">
                        <Layout.Stack
                            direction={$isSmallViewport ? 'column' : 'row'}
                            gap={$isSmallViewport ? 'xl' : 'xxl'}>
                            <div class="step-info">
                                <Layout.Stack gap="m">
                                    <Typography.Title color="--fgcolor-neutral-primary" size="s"
                                        >Connect your platform</Typography.Title>
                                    <div class="build-info">
                                        <span>
                                            Start building with your preferred web, mobile, and
                                            native frameworks.
                                        </span>
                                    </div>
                                </Layout.Stack>
                            </div>
                            <Layout.Stack gap="l">
                                <Layout.Stack
                                    gap="l"
                                    direction={$isSmallViewport ? 'column' : 'row'}>
                                    <Card.Button
                                        on:click={() => {
                                            openPlatformWizard(0, platformMap.get('Web'));
                                        }}
                                        padding="s"
                                        ><Layout.Stack
                                            gap={platformMap.has('Web') ? 'm' : 'xl'}
                                            height="100%"
                                            justifyContent="space-between"
                                            ><div class="card-top-image web-image-light"></div>
                                            <div class="card-top-image web-image-dark"></div>
                                            {#if platformMap.has('Web')}
                                                <Layout.Stack alignItems="flex-start">
                                                    <Badge
                                                        size="s"
                                                        variant="secondary"
                                                        content="In progress">
                                                        <div
                                                            slot="start"
                                                            style:margin="-4px 0 0 2px">
                                                            <ProgressCircle
                                                                size="xs"
                                                                showAnimation={false}
                                                                backgroundStrokeColor="--progress-background-color"
                                                                progress={33} />
                                                        </div>
                                                    </Badge>
                                                </Layout.Stack>
                                            {/if}
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s">Web</Typography.Title>
                                                {#if platformMap.has('Web')}<Button.Button size="xs"
                                                        >Continue</Button.Button
                                                    >{:else}
                                                    <div class="arrow-icon">
                                                        <Icon icon={IconArrowRight} size="s" />
                                                    </div>
                                                {/if}
                                            </Layout.Stack>
                                        </Layout.Stack></Card.Button>
                                    <Card.Button
                                        on:click={() => {
                                            openPlatformWizard(4, platformMap.get('React Native'));
                                        }}
                                        padding="s"
                                        ><Layout.Stack
                                            gap={platformMap.has('React Native') ? 'm' : 'xl'}
                                            height="100%"
                                            justifyContent="space-between">
                                            <div class="card-top-image reactnative-image-light">
                                            </div>
                                            <div class="card-top-image reactnative-image-dark">
                                            </div>
                                            {#if platformMap.has('React Native')}
                                                <Layout.Stack alignItems="flex-start">
                                                    <Badge
                                                        size="s"
                                                        variant="secondary"
                                                        content="In progress">
                                                        <div
                                                            slot="start"
                                                            style:margin="-4px 0 0 2px">
                                                            <ProgressCircle
                                                                size="xs"
                                                                showAnimation={false}
                                                                backgroundStrokeColor="--progress-background-color"
                                                                progress={33} />
                                                        </div>
                                                    </Badge>
                                                </Layout.Stack>
                                            {/if}
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s"
                                                    >React Native</Typography.Title>
                                                {#if platformMap.has('React Native')}<Button.Button
                                                        size="xs">Continue</Button.Button
                                                    >{:else}
                                                    <div class="arrow-icon">
                                                        <Icon icon={IconArrowRight} size="s" />
                                                    </div>
                                                {/if}
                                            </Layout.Stack>
                                        </Layout.Stack></Card.Button>
                                </Layout.Stack>
                                <Layout.Stack
                                    gap="l"
                                    direction={$isSmallViewport ? 'column' : 'row'}>
                                    <Card.Button
                                        on:click={() => {
                                            openPlatformWizard(3, platformMap.get('Apple'));
                                        }}
                                        padding="s">
                                        <Layout.Stack
                                            gap={platformMap.has('Apple') ? 's' : 'xxl'}
                                            height="100%"
                                            justifyContent="space-between">
                                            <img
                                                class="platform-image"
                                                src={$app.themeInUse === 'dark'
                                                    ? PlatformIosImgSourceDark
                                                    : PlatformIosImgSource}
                                                alt="" />
                                            {#if platformMap.has('Apple')}
                                                <Layout.Stack alignItems="flex-start">
                                                    <Badge
                                                        size="s"
                                                        variant="secondary"
                                                        content="In progress">
                                                        <div
                                                            slot="start"
                                                            style:margin="-4px 0 0 2px">
                                                            <ProgressCircle
                                                                size="xs"
                                                                showAnimation={false}
                                                                backgroundStrokeColor="--progress-background-color"
                                                                progress={33} />
                                                        </div>
                                                    </Badge>
                                                </Layout.Stack>
                                            {/if}
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s">Apple</Typography.Title>
                                                {#if platformMap.has('Apple')}<Button.Button
                                                        size="xs">Continue</Button.Button
                                                    >{:else}
                                                    <div class="arrow-icon">
                                                        <Icon icon={IconArrowRight} size="s" />
                                                    </div>
                                                {/if}</Layout.Stack>
                                        </Layout.Stack>
                                    </Card.Button>
                                    <Card.Button
                                        on:click={() => {
                                            openPlatformWizard(2, platformMap.get('Android'));
                                        }}
                                        padding="s">
                                        <Layout.Stack
                                            gap={platformMap.has('Android') ? 's' : 'xxl'}
                                            height="100%"
                                            justifyContent="space-between">
                                            <img
                                                class="platform-image"
                                                src={$app.themeInUse === 'dark'
                                                    ? PlatformAndroidImgSourceDark
                                                    : PlatformAndroidImgSource}
                                                alt="" />
                                            {#if platformMap.has('Android')}
                                                <Layout.Stack alignItems="flex-start">
                                                    <Badge
                                                        size="s"
                                                        variant="secondary"
                                                        content="In progress">
                                                        <div
                                                            slot="start"
                                                            style:margin="-4px 0 0 2px">
                                                            <ProgressCircle
                                                                size="xs"
                                                                showAnimation={false}
                                                                backgroundStrokeColor="--progress-background-color"
                                                                progress={33} />
                                                        </div>
                                                    </Badge>
                                                </Layout.Stack>
                                            {/if}
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s"
                                                    >Android</Typography.Title>
                                                {#if platformMap.has('Android')}<Button.Button
                                                        size="xs">Continue</Button.Button
                                                    >{:else}
                                                    <div class="arrow-icon">
                                                        <Icon icon={IconArrowRight} size="s" />
                                                    </div>
                                                {/if}</Layout.Stack>
                                        </Layout.Stack>
                                    </Card.Button>
                                    <Card.Button
                                        on:click={() => {
                                            openPlatformWizard(1, platformMap.get('Flutter'));
                                        }}
                                        padding="s">
                                        <Layout.Stack
                                            gap={platformMap.has('Flutter') ? 's' : 'xxl'}
                                            height="100%"
                                            justifyContent="space-between">
                                            <img
                                                class="platform-image"
                                                src={$app.themeInUse === 'dark'
                                                    ? PlatformFlutterImgSourceDark
                                                    : PlatformFlutterImgSource}
                                                alt="" />
                                            {#if platformMap.has('Flutter')}
                                                <Layout.Stack alignItems="flex-start">
                                                    <Badge
                                                        size="s"
                                                        variant="secondary"
                                                        content="In progress">
                                                        <div
                                                            slot="start"
                                                            style:margin="-4px 0 0 2px">
                                                            <ProgressCircle
                                                                size="xs"
                                                                showAnimation={false}
                                                                backgroundStrokeColor="--progress-background-color"
                                                                progress={33} />
                                                        </div>
                                                    </Badge>
                                                </Layout.Stack>
                                            {/if}
                                            <Layout.Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between">
                                                <Typography.Title size="s"
                                                    >Flutter</Typography.Title>
                                                {#if platformMap.has('Flutter')}<Button.Button
                                                        size="xs">Continue</Button.Button
                                                    >{:else}
                                                    <div class="arrow-icon">
                                                        <Icon icon={IconArrowRight} size="s" />
                                                    </div>
                                                {/if}</Layout.Stack>
                                        </Layout.Stack>
                                    </Card.Button>
                                </Layout.Stack>
                                <Layout.Stack direction="row" gap="xxs" alignItems="center">
                                    <Typography.Text>Or connect</Typography.Text>
                                    <Link.Button variant="muted" on:click={createKey}
                                        >server side</Link.Button>
                                    <div style:padding-inline-start="8px">
                                        <AvatarGroup
                                            icons={[IconPython, IconNodeJs, IconPhp]}
                                            total={7}
                                            size="s" />
                                    </div>
                                </Layout.Stack>
                            </Layout.Stack>
                        </Layout.Stack></Step.Item>
                    <Step.Item state="next"
                        ><div>
                            <Typography.Title color="--fgcolor-neutral-tertiary" size="s"
                                >Build your app</Typography.Title>
                        </div></Step.Item>
                </Step.List>
            {:else}
                <Step.List>
                    <Step.Item state="previous"
                        ><div>
                            <Typography.Title color="--fgcolor-neutral-tertiary" size="s"
                                >Create project</Typography.Title>
                        </div></Step.Item>
                    <Step.Item state="previous"
                        ><div>
                            <Typography.Title color="--fgcolor-neutral-tertiary" size="s"
                                >Connect your platform</Typography.Title>
                        </div></Step.Item>
                    <Step.Item state="current">
                        <Layout.Stack
                            direction={$isSmallViewport ? 'column' : 'row'}
                            gap={$isSmallViewport ? 'xl' : 'xxl'}>
                            <div class="step-info">
                                <Layout.Stack gap="m">
                                    <Typography.Title color="--fgcolor-neutral-primary" size="s"
                                        >Build your app</Typography.Title>
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
                                    <Card.Button
                                        on:click={() => {
                                            trackEvent(Click.OnboardingSetupDatabaseClick);
                                            goto(`${base}/project-${projectId}/databases`);
                                        }}
                                        padding="s"
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
                                    <Card.Base padding="s"
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
                                                        on:click={() => {
                                                            trackEvent(
                                                                Click.OnboardingApiReferencesClick
                                                            );
                                                        }}
                                                        target="_blank">API references</Link.Anchor>
                                                    <Link.Anchor
                                                        variant="quiet-muted"
                                                        href="https://appwrite.io/docs/tutorials"
                                                        on:click={() => {
                                                            trackEvent(
                                                                Click.OnboardingTutorialsClick
                                                            );
                                                        }}
                                                        target="_blank">Tutorials</Link.Anchor>
                                                    <Link.Anchor
                                                        variant="quiet-muted"
                                                        href="https://appwrite.io/docs/products/storage/quick-start"
                                                        on:click={() => {
                                                            trackEvent(
                                                                Click.OnboardingStorageQuickstartClick
                                                            );
                                                        }}
                                                        target="_blank"
                                                        >Storage quick start
                                                    </Link.Anchor>
                                                    <Link.Anchor
                                                        variant="quiet-muted"
                                                        href="https://appwrite.io/docs/products/functions/quick-start"
                                                        on:click={() => {
                                                            trackEvent(
                                                                Click.OnboardingFunctionsQuickstartClick
                                                            );
                                                        }}
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
                                        <Card.Base padding="s"
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
                                                                on:click={() => {
                                                                    trackEvent(
                                                                        Click.OnboardingAuthEmailPasswordClick
                                                                    );
                                                                }}
                                                                >E-mail and password
                                                            </Link.Anchor>
                                                            <Link.Anchor
                                                                variant="quiet-muted"
                                                                href={`${base}/project-${projectId}/auth/settings`}
                                                                on:click={() => {
                                                                    trackEvent(
                                                                        Click.OnboardingAuthOauth2Click
                                                                    );
                                                                }}>OAuth 2</Link.Anchor>
                                                            <Link.Anchor
                                                                variant="quiet-muted"
                                                                href={`${base}/project-${projectId}/auth/settings`}
                                                                on:click={() => {
                                                                    trackEvent(
                                                                        Click.OnboardingAuthAllMethodsClick
                                                                    );
                                                                }}>View all methods</Link.Anchor>
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

                                    <Card.Link
                                        href="https://appwrite.io/discord"
                                        padding="s"
                                        on:click={() => {
                                            trackEvent(Click.OnboardingDiscordClick);
                                        }}>
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
                                                        color="--fgcolor-neutral-secondary">
                                                        Join our Discord for support, tips and
                                                        product updates</Typography.Text>
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

    :global(.theme-light) {
        --progress-background-color: var(--neutral-200);
        .web-image-dark,
        .reactnative-image-dark {
            display: none;
        }
    }

    :global(.theme-dark) {
        --progress-background-color: var(--neutral-600);
        .web-image-light,
        .reactnative-image-light {
            display: none;
        }
    }

    .dashboard-content {
        .card-top-image {
            margin-top: calc(-1 * var(--base-16, 16px));
            margin-left: calc(-1 * var(--base-16, 16px));
            width: calc(100% + var(--base-32, 32px));
            height: 160px;
            background-size: cover;
            background-position: center;
            border-radius: var(--border-radius-m) var(--border-radius-m) 0 0;

            @media (min-width: 1200px) {
                height: 187px;
            }
        }

        .web-image-light {
            background-image: url('./assets/platform-web.png');
        }
        .web-image-dark {
            background-image: url('./assets/platform-web-dark.png');
        }

        .reactnative-image-light {
            background-image: url('./assets/platform-reactnative.png');
        }
        .reactnative-image-dark {
            background-image: url('./assets/platform-reactnative-dark.png');
        }
        .database-card-image {
            background-size: cover;
            background-position: bottom;
            background-repeat: no-repeat;
        }
        .full-height-card {
            height: 100%;
        }

        .auth-image {
            width: 100%;
            height: 200px;
            margin-right: calc(-1 * var(--base-16, 16px));
            margin-bottom: calc(-1 * var(--base-16, 16px));
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
            color: var(--border-neutral-strong);
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
