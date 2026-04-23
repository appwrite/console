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
    import { getApiEndpoint, realtime, sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { fade } from 'svelte/transition';
    import ConnectionLine from './components/ConnectionLine.svelte';
    import OnboardingPlatformCard from './components/OnboardingPlatformCard.svelte';
    import { ID } from '@appwrite.io/console';
    import { project } from '../../store';
    import { getCorrectTitle, type PlatformProps } from './store';
    import LlmBanner from './llmBanner.svelte';

    let { isConnectPlatform = false, platform = 'flutter-android' }: PlatformProps = $props();

    let showExitModal = $state(false);
    let isCreatingPlatform = $state(false);
    let connectionSuccessful = $state(false);
    let isPlatformCreated = $state(isConnectPlatform);

    const projectId = page.params.project;
    const VERSIONS_ENDPOINT = (() => {
        const endpoint = getApiEndpoint(page.params.region);
        const url = new URL('/versions', endpoint);
        return url.toString();
    })();
    let flutterSdkVersion = $state('20.3.0');

    function buildFlutterInstructions(version: string) {
        return `
Install the Appwrite Flutter SDK using the following command:

\`\`\`
flutter pub add appwrite:${version}
\`\`\`

From a suitable lib directory, export the Appwrite client as a global variable, hardcode the project details too:

\`\`\`
final Client client = Client()
  .setProject("${projectId}")
  .setEndpoint("${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}");
\`\`\`

On the homepage of the app, create a button that says "Send a ping" and when clicked, it should call the following function:

\`\`\`
client.ping();
\`\`\`
        `;
    }

    const alreadyExistsInstructions = $derived(buildFlutterInstructions(flutterSdkVersion));

    const gitCloneCode =
        '\ngit clone https://github.com/appwrite/starter-for-flutter\ncd starter-for-flutter\n';

    const configCode = `class Environment {
  static const String appwriteProjectId = '${projectId}';
  static const String appwriteProjectName = '${$project.name}';
  static const String appwritePublicEndpoint = '${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}';
}`;

    let platforms: { [key: string]: string } = {
        Android: 'flutter-android',
        iOS: 'flutter-ios',
        Linux: 'flutter-linux',
        macOS: 'flutter-macos',
        Windows: 'flutter-windows',
        Web: 'flutter-web'
    };

    const placeholder: Record<
        string,
        {
            name: string;
            hostname: string;
            tooltip: string;
        }
    > = {
        'flutter-android': {
            name: 'My Android app',
            hostname: 'com.company.appname',
            tooltip:
                'Your package name is generally the applicationId in your app-level build.gradle file.'
        },
        'flutter-ios': {
            name: 'My iOS app',
            hostname: 'com.company.appname',
            tooltip:
                "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
        },
        'flutter-linux': {
            name: 'My Linux app',
            hostname: 'appname',
            tooltip: 'Your application name'
        },
        'flutter-macos': {
            name: 'My mac OS app',
            hostname: 'com.company.appname',
            tooltip:
                "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
        },
        'flutter-windows': {
            name: 'My Windows app',
            hostname: 'appname',
            tooltip: 'Your application name'
        },
        'flutter-web': {
            name: 'My Web app',
            hostname: 'localhost',
            tooltip:
                'The hostname that your website will use to interact with the Appwrite APIs in production or development environments. No protocol or port number required.'
        }
    };

    const hostnameLabel: Record<string, string> = {
        'flutter-android': 'Package name',
        'flutter-ios': 'Bundle ID',
        'flutter-linux': 'Package name',
        'flutter-macos': 'Bundle ID',
        'flutter-web': 'Hostname',
        'flutter-windows': 'Package name'
    };

    async function fetchFlutterSdkVersion() {
        try {
            const response = await fetch(VERSIONS_ENDPOINT);
            if (!response.ok) {
                throw new Error(`Failed to fetch versions: ${response.status}`);
            }
            const data = await response.json();
            const latestVersion = data?.['client-flutter'];
            if (typeof latestVersion === 'string' && latestVersion.trim()) {
                flutterSdkVersion = latestVersion.trim();
            }
        } catch (error) {
            console.error('Unable to fetch latest Flutter SDK version', error);
        }
    }

    async function createFlutterPlatform() {
        try {
            isCreatingPlatform = true;
            const projectSdk = sdk.forProject(page.params.region, page.params.project).project;
            const platformId = ID.unique();
            switch (platform) {
                case 'flutter-android':
                    await projectSdk.createAndroidPlatform({
                        platformId,
                        name: $createPlatform.name,
                        applicationId: $createPlatform.key
                    });
                    break;
                case 'flutter-ios':
                case 'flutter-macos':
                    await projectSdk.createApplePlatform({
                        platformId,
                        name: $createPlatform.name,
                        bundleIdentifier: $createPlatform.key
                    });
                    break;
                case 'flutter-linux':
                    await projectSdk.createLinuxPlatform({
                        platformId,
                        name: $createPlatform.name,
                        packageName: $createPlatform.key
                    });
                    break;
                case 'flutter-windows':
                    await projectSdk.createWindowsPlatform({
                        platformId,
                        name: $createPlatform.name,
                        packageIdentifierName: $createPlatform.key
                    });
                    break;
                case 'flutter-web':
                    await projectSdk.createWebPlatform({
                        platformId,
                        name: $createPlatform.name,
                        hostname: $createPlatform.hostname || undefined
                    });
                    break;
                default:
                    throw new Error(`Unknown platform type: ${platform}`);
            }

            isPlatformCreated = true;
            trackEvent(Submit.PlatformCreate, {
                type: platform
            });

            addNotification({
                type: 'success',
                message: 'Platform created.'
            });

            await invalidate(Dependencies.PROJECT);
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
        fetchFlutterSdkVersion();
        const unsubscribe = realtime.forConsole(page.params.region, 'console', (response) => {
            if (response.events.includes(`projects.${projectId}.ping`)) {
                connectionSuccessful = true;
                invalidate(Dependencies.ORGANIZATION);
                invalidate(Dependencies.PROJECT);
                unsubscribe();
            }
        });

        return () => {
            unsubscribe();
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
                                {#if platform === 'flutter-web'}
                                    <InputText
                                        id="hostname"
                                        label={hostnameLabel[platform]}
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
                                        label={hostnameLabel[platform]}
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
                    <LlmBanner
                        platform="flutter"
                        {configCode}
                        {alreadyExistsInstructions}
                        openers={['cursor']} />
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
