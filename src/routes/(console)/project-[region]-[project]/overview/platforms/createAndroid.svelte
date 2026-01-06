<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { createPlatform } from './wizard/store';
    import { Dependencies } from '$lib/constants';
    import {
        Code,
        Layout,
        Icon,
        Typography,
        Fieldset,
        InlineCode,
        Tooltip
    } from '@appwrite.io/pink-svelte';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { IconAndroid, IconAppwrite, IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Card } from '$lib/components';
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { getApiEndpoint, realtime, sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { fade } from 'svelte/transition';
    import ConnectionLine from './components/ConnectionLine.svelte';
    import OnboardingPlatformCard from './components/OnboardingPlatformCard.svelte';
    import { PlatformType } from '@appwrite.io/console';
    import { project } from '../../store';
    import { getCorrectTitle, type PlatformProps } from './store';
    import LlmBanner from './llmBanner.svelte';

    let { isConnectPlatform = false }: PlatformProps = $props();

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
    let androidSdkVersion = $state('11.3.0');

    function buildAndroidInstructions(version: string) {
        return `
Confirm you're working inside the correct Android project before editing anything:
- Navigate into the directory that contains the real Android app module (look for gradlew, settings.gradle, and the app-level build.gradle(.kts)).
- If Cursor opens in a parent folder (like your home directory) or you see multiple Android projects, ask which one to modify before making changes.
- Update the app-level build.gradle.kts by default, but be ready to edit a Groovy build.gradle if the project hasn't migrated to Kotlin DSL yet.

Prefer Version Catalogs when adding the Appwrite SDK:
1. If ./gradle/libs.versions.toml exists, add or reuse an Appwrite entry:
\`\`\`toml
[libraries]
appwrite = { module = "io.appwrite:sdk-for-android", version = "${version}" }
\`\`\`
2. Reference it inside the module's dependencies block:
\`\`\`kotlin
dependencies {
    implementation(libs.appwrite)
}
\`\`\`
Only when the project lacks ./gradle/libs.versions.toml should you hardcode the dependency:
\`\`\`kotlin
implementation("io.appwrite:sdk-for-android:${version}")
\`\`\`
Legacy Groovy scripts should use:
\`\`\`groovy
implementation "io.appwrite:sdk-for-android:${version}"
\`\`\`

Before introducing any new files, search the project (app/src, libs/, shared modules, etc.) for existing Appwrite client helpers (look for \`Client(\`, \`AppwriteClient\`, or \`.setEndpoint\`). If a client already exists, update its configuration instead of creating a duplicate.

Ensure the Appwrite client is initialized with the application context and current project info:
\`\`\`kotlin
val client = Client(applicationContext)
    .setEndpoint("${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}")
    .setProject("${projectId}")

val account = Account(client)
\`\`\`

From the app's entry point (e.g., Application class or the first launched Activity), automatically invoke a helper that pings Appwrite so the user can verify connectivity and will be reflected on the Appwrite console:
\`\`\`kotlin
client.ping()
\`\`\`
`;
    }

    const alreadyExistsInstructions = $derived(buildAndroidInstructions(androidSdkVersion));

    const gitCloneCode =
        '\ngit clone https://github.com/appwrite/starter-for-android\ncd starter-for-android\n';

    const configCode = `const val APPWRITE_PROJECT_ID = "${projectId}"
const val APPWRITE_PROJECT_NAME = "${$project.name}"
const val APPWRITE_PUBLIC_ENDPOINT = "${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}"`;

    async function fetchAndroidSdkVersion() {
        try {
            const response = await fetch(VERSIONS_ENDPOINT);
            if (!response.ok) {
                throw new Error(`Failed to fetch versions: ${response.status}`);
            }
            const data = await response.json();
            const latestVersion = data?.['client-android'];
            if (typeof latestVersion === 'string' && latestVersion.trim()) {
                androidSdkVersion = latestVersion.trim();
            }
        } catch (error) {
            console.error('Unable to fetch latest Android SDK version', error);
        }
    }

    async function createAndroidPlatform() {
        try {
            isCreatingPlatform = true;
            await sdk.forConsole.projects.createPlatform({
                projectId,
                type: PlatformType.Android,
                name: $createPlatform.name,
                key: $createPlatform.key || undefined
            });

            isPlatformCreated = true;
            trackEvent(Submit.PlatformCreate, {
                type: 'android'
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
        fetchAndroidSdkVersion();
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
    title={getCorrectTitle(isConnectPlatform, 'Android')}>
    <Layout.Stack gap="xxl">
        <!-- Step One -->
        {#if !isPlatformCreated}
            <Form onSubmit={createAndroidPlatform}>
                <Fieldset legend="Details">
                    <Layout.Stack gap="l" alignItems="flex-end">
                        <Layout.Stack gap="s">
                            <InputText
                                id="name"
                                label="Name"
                                placeholder="My Android app"
                                required
                                bind:value={$createPlatform.name} />

                            <!-- Tooltips on InputText don't work as of now -->
                            <InputText
                                id="key"
                                required
                                label="Package name"
                                placeholder="com.company.appname"
                                bind:value={$createPlatform.key}>
                                <Tooltip slot="info" maxWidth="15rem">
                                    <Icon icon={IconInfo} size="s" />
                                    <Typography.Caption variant="400" slot="tooltip">
                                        Your package name is generally the applicationId in your
                                        app-level build.gradle file.
                                    </Typography.Caption>
                                </Tooltip>
                            </InputText>
                        </Layout.Stack>

                        <Button
                            fullWidthMobile
                            size="s"
                            submit
                            forceShowLoader
                            submissionLoader={isCreatingPlatform}
                            disabled={!$createPlatform.name ||
                                !$createPlatform.key ||
                                isCreatingPlatform}>
                            Create platform
                        </Button>
                    </Layout.Stack>
                </Fieldset>
            </Form>
        {:else}
            <Layout.Stack gap="xxl">
                <Card padding="s" radius="s">
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        gap="xs">
                        <Layout.Stack direction="row" alignItems="center" gap="s">
                            <Icon size="m" icon={IconAndroid} />
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                {$createPlatform.name} ({$createPlatform.key})
                            </Typography.Text>
                        </Layout.Stack>
                    </Layout.Stack>
                </Card>
            </Layout.Stack>
        {/if}

        <!-- Step Two -->
        {#if isPlatformCreated}
            <Fieldset legend="Clone starter" badge="Optional">
                <Layout.Stack gap="l">
                    <LlmBanner
                        platform="android"
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
                        >2. Open the file <InlineCode size="s" code="constants/AppwriteConfig.kt" />
                        and update the configuration settings.</Typography.Text>

                    <!-- Temporary fix: Remove this div once Code splitting issue with stack spacing is resolved -->
                    <div class="pink2-code-margin-fix">
                        <Code lang="kotlin" lineNumbers code={configCode} />
                    </div>

                    <Typography.Text variant="m-500"
                        >3. Run the app on a connected device or emulator, then click the <InlineCode
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
                        iconColor="#3ddc84"
                        icon={IconAndroid} />

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
