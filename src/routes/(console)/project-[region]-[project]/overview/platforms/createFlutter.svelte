<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { createPlatform } from './wizard/store';
    import { Dependencies } from '$lib/constants';
    import {
        Card as Pink2Card,
        Code,
        Layout,
        Icon,
        Typography,
        Fieldset,
        InlineCode,
        Tooltip
    } from '@appwrite.io/pink-svelte';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { IconFlutter, IconAppwrite, IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Card } from '$lib/components';
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { realtime, sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { fade } from 'svelte/transition';
    import ConnectionLine from './components/ConnectionLine.svelte';
    import OnboardingPlatformCard from './components/OnboardingPlatformCard.svelte';
    import { PlatformType } from '@appwrite.io/console';
    import { project } from '../../store';
    import { getCorrectTitle, type PlatformProps } from './store';

    let { isConnectPlatform = false, platform = PlatformType.Flutterandroid }: PlatformProps =
        $props();

    let showExitModal = $state(false);
    let isCreatingPlatform = $state(false);
    let connectionSuccessful = $state(false);
    let isPlatformCreated = $state(isConnectPlatform);

    const projectId = page.params.project;

    const gitCloneCode =
        '\ngit clone https://github.com/appwrite/starter-for-flutter\ncd starter-for-flutter\n';

    const configCode = `class Environment {
  static const String appwriteProjectId = '${projectId}';
  static const String appwriteProjectName = '${$project.name}';
  static const String appwritePublicEndpoint = '${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}';
}`;

    let platforms: { [key: string]: PlatformType } = {
        Android: PlatformType.Flutterandroid,
        iOS: PlatformType.Flutterios,
        Linux: PlatformType.Flutterlinux,
        macOS: PlatformType.Fluttermacos,
        Windows: PlatformType.Flutterwindows,
        Web: PlatformType.Flutterweb
    };

    const placeholder: Partial<
        Record<
            PlatformType,
            {
                name: string;
                hostname: string;
                tooltip: string;
            }
        >
    > = {
        [PlatformType.Flutterandroid]: {
            name: 'My Android app',
            hostname: 'com.company.appname',
            tooltip:
                'Your package name is generally the applicationId in your app-level build.gradle file.'
        },
        [PlatformType.Flutterios]: {
            name: 'My iOS app',
            hostname: 'com.company.appname',
            tooltip:
                "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
        },
        [PlatformType.Flutterlinux]: {
            name: 'My Linux app',
            hostname: 'appname',
            tooltip: 'Your application name'
        },
        [PlatformType.Fluttermacos]: {
            name: 'My mac OS app',
            hostname: 'com.company.appname',
            tooltip:
                "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
        },
        [PlatformType.Flutterwindows]: {
            name: 'My Windows app',
            hostname: 'appname',
            tooltip: 'Your application name'
        },
        [PlatformType.Flutterweb]: {
            name: 'My Web app',
            hostname: 'localhost',
            tooltip:
                'The hostname that your website will use to interact with the Appwrite APIs in production or development environments. No protocol or port number required.'
        }
    };

    const hostname: Partial<Record<PlatformType, string>> = {
        [PlatformType.Flutterandroid]: 'Package name',
        [PlatformType.Flutterios]: 'Bundle ID',
        [PlatformType.Flutterlinux]: 'Package name',
        [PlatformType.Fluttermacos]: 'Bundle ID',
        [PlatformType.Flutterweb]: 'Hostname',
        [PlatformType.Flutterwindows]: 'Package name'
    };

    async function createFlutterPlatform() {
        try {
            isCreatingPlatform = true;
            await sdk.forConsole.projects.createPlatform({
                projectId,
                type: platform,
                name: $createPlatform.name,
                key:
                    platform === PlatformType.Flutterweb
                        ? undefined
                        : $createPlatform.key || undefined,
                hostname:
                    platform === PlatformType.Flutterweb
                        ? $createPlatform.hostname || undefined
                        : undefined
            });

            isPlatformCreated = true;
            trackEvent(Submit.PlatformCreate, {
                type: platform
            });

            addNotification({
                type: 'success',
                message: 'Platform created.'
            });

            invalidate(Dependencies.PROJECT);
            invalidate(Dependencies.PLATFORMS);
        } catch (error) {
            trackError(error, Submit.PlatformCreate);
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            isCreatingPlatform = false;
        }
    }

    async function resetPlatformStore() {
        createPlatform.reset();
    }

    onMount(() => {
        const subscription = realtime.forConsole(page.params.region, 'console', (response) => {
            if (response.events.includes(`projects.${projectId}.ping`)) {
                connectionSuccessful = true;
                invalidate(Dependencies.ORGANIZATION);
                invalidate(Dependencies.PROJECT);
                subscription();
            }
        });

        return () => {
            subscription();
            resetPlatformStore();
        };
    });
</script>

<Wizard
    bind:showExitModal
    confirmExit={!isPlatformCreated}
    title={getCorrectTitle(isConnectPlatform, 'Flutter')}>
    <Layout.Stack gap="xxl">
        <Form onSubmit={createFlutterPlatform}>
            <Layout.Stack gap="xxl">
                <!-- Step One -->
                <Layout.Grid gap="l" rowGap="l" columns={3} columnsXS={2} columnsXXS={1}>
                    {#each Object.entries(platforms) as [key, value]}
                        <Pink2Card.Selector
                            {value}
                            id={key}
                            title={key}
                            imageRadius="s"
                            name="framework"
                            bind:group={platform}
                            disabled={isCreatingPlatform || isPlatformCreated} />
                    {/each}
                </Layout.Grid>

                <!-- Step Two -->
                {#if !isPlatformCreated}
                    <Fieldset legend="Details">
                        <Layout.Stack gap="l" alignItems="flex-end">
                            <Layout.Stack gap="s">
                                <InputText
                                    id="name"
                                    label="Name"
                                    placeholder={placeholder[platform].name}
                                    required
                                    bind:value={$createPlatform.name} />

                                <!-- Tooltips on InputText don't work as of now -->
                                {#if platform === PlatformType.Flutterweb}
                                    <InputText
                                        id="hostname"
                                        label={hostname[platform]}
                                        placeholder={placeholder[platform].hostname}
                                        required
                                        bind:value={$createPlatform.hostname}>
                                        <Tooltip slot="info" maxWidth="15rem">
                                            <Icon icon={IconInfo} size="s" />
                                            <Typography.Caption variant="400" slot="tooltip">
                                                {placeholder[platform].tooltip}
                                            </Typography.Caption>
                                        </Tooltip>
                                    </InputText>
                                {:else}
                                    <InputText
                                        id="key"
                                        label={hostname[platform]}
                                        placeholder={placeholder[platform].hostname}
                                        required
                                        bind:value={$createPlatform.key}>
                                        <Tooltip slot="info" maxWidth="15rem">
                                            <Icon icon={IconInfo} size="s" />
                                            <Typography.Caption variant="400" slot="tooltip">
                                                {placeholder[platform].tooltip}
                                            </Typography.Caption>
                                        </Tooltip>
                                    </InputText>
                                {/if}
                            </Layout.Stack>

                            <Button
                                fullWidthMobile
                                size="s"
                                submit
                                forceShowLoader
                                submissionLoader={isCreatingPlatform}
                                disabled={!platform ||
                                    !$createPlatform.name ||
                                    (!$createPlatform.key && !$createPlatform.hostname) ||
                                    isCreatingPlatform}>
                                Create platform
                            </Button>
                        </Layout.Stack>
                    </Fieldset>
                {:else}
                    <Layout.Stack gap="xxl">
                        <Card padding="s" radius="s">
                            <Layout.Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                gap="xs">
                                <Layout.Stack direction="row" alignItems="center" gap="s">
                                    <Icon size="m" icon={IconFlutter} />
                                    <Typography.Text
                                        variant="m-400"
                                        color="--fgcolor-neutral-primary">
                                        {$createPlatform.name} ({$createPlatform.hostname ||
                                            $createPlatform.key})
                                    </Typography.Text>
                                </Layout.Stack>
                            </Layout.Stack>
                        </Card>
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </Form>

        <!-- Step Three -->
        {#if isPlatformCreated}
            <Fieldset legend="Clone starter" badge="Optional">
                <Layout.Stack gap="l">
                    <Typography.Text variant="m-500">
                        1. If you're starting a new project, you can clone our starter kit from
                        GitHub using the terminal, VSCode or Android Studio.
                    </Typography.Text>

                    <!-- Temporary fix: Remove this div once Code splitting issue with stack spacing is resolved -->
                    <div class="pink2-code-margin-fix">
                        <Code lang="bash" lineNumbers code={gitCloneCode} />
                    </div>

                    <Typography.Text variant="m-500"
                        >2. Replace <InlineCode size="s" code="lib/config/environment.dart" />
                        to reflect the values below:</Typography.Text>

                    <!-- Temporary fix: Remove this div once Code splitting issue with stack spacing is resolved -->
                    <div class="pink2-code-margin-fix">
                        <Code lang="dart" lineNumbers code={configCode} />
                    </div>

                    <Typography.Text variant="m-500"
                        >3. Run the app on a connected device or simulator using <InlineCode
                            size="s"
                            code="flutter run -d [device_name]" />, then click the <InlineCode
                            size="s"
                            code="Send a ping" /> button to verify the setup.</Typography.Text>
                </Layout.Stack>
            </Fieldset>
        {/if}
    </Layout.Stack>
    <svelte:fragment slot="aside">
        <Card padding="l" class="responsive-padding">
            <Layout.Stack gap="xxl">
                <Layout.Stack direction="row" justifyContent="center" gap="none">
                    <OnboardingPlatformCard
                        iconSize={2.526}
                        iconColor="#47C5FB"
                        icon={IconFlutter} />

                    <ConnectionLine status={connectionSuccessful} />

                    <OnboardingPlatformCard
                        iconSize={2.526}
                        iconColor="#FD366E"
                        icon={IconAppwrite} />
                </Layout.Stack>

                {#if isPlatformCreated}
                    <Layout.Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        gap="l">
                        {#if !connectionSuccessful}
                            <Typography.Text variant="m-400"
                                >Waiting for connection...</Typography.Text>
                        {:else}
                            <!-- cannot apply fade on components -->
                            <div
                                in:fade={{ duration: 2500 }}
                                class="u-flex u-flex-vertical u-cross-center u-gap-8">
                                <Typography.Title size="m">Congratulations!</Typography.Title>

                                <Typography.Text variant="m-400"
                                    >You connected your app successfully.</Typography.Text>
                            </div>
                        {/if}
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </Card>
    </svelte:fragment>

    <svelte:fragment slot="footer">
        {#if isPlatformCreated}
            <Button
                size="s"
                fullWidthMobile
                secondary
                disabled={isCreatingPlatform}
                href={location.pathname}>
                Skip, go to dashboard
            </Button>
        {/if}
    </svelte:fragment>
</Wizard>

<style lang="scss">
    :global(.pink2-code-margin-fix pre) {
        margin: revert;
    }

    :global(.responsive-padding) {
        @media (max-width: 768px) {
            padding: 16px;
        }
    }
</style>
