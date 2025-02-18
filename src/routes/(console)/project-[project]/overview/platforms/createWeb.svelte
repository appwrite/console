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
        Card,
        Button as ButtonV2
    } from '@appwrite.io/pink-svelte';
    import { Button, Form } from '$lib/elements/forms';
    import {
        IconVue,
        IconAppwrite,
        IconSvelte,
        IconReact,
        IconNuxt
    } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/stores';
    import { type ComponentType, onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { fade } from 'svelte/transition';
    import ConnectionLine from './components/ConnectionLine.svelte';
    import OnboardingPlatformCard from './components/OnboardingPlatformCard.svelte';
    import { PlatformType } from '@appwrite.io/console';
    import ReactFrameworkIcon from './components/ReactFrameworkIcon.svelte';
    import SvelteFrameworkIcon from '$routes/(console)/project-[project]/overview/platforms/components/SvelteFrameworkIcon.svelte';
    import NuxtFrameworkIcon from '$routes/(console)/project-[project]/overview/platforms/components/NuxtFrameworkIcon.svelte';
    import NextjsFrameworkIcon from '$routes/(console)/project-[project]/overview/platforms/components/NextjsFrameworkIcon.svelte';
    import VueFrameworkIcon from '$routes/(console)/project-[project]/overview/platforms/components/VueFrameworkIcon.svelte';
    import NoFrameworkIcon from './components/NoFrameworkIcon.svelte';

    export let key;

    let showExitModal = false;
    let isPlatformCreated = !!key;
    let isCreatingPlatform = false;
    let connectionSuccessful = false;
    let isChangingFramework = false;

    const projectId = $page.params.project;

    const updateConfigCode = `APPWRITE_PROJECT_ID = "${projectId}"
APPWRITE_PUBLIC_ENDPOINT = "${sdk.forProject.client.config.endpoint}"
        `;
    type FrameworkType = {
        key: string;
        label: string;
        icon: ComponentType;
        smallIcon: ComponentType;
        gitCloneCode: string;
    };
    export let platform: PlatformType = PlatformType.Flutterandroid;
    export let selectedFrameworkKey: string | undefined = key ? key : undefined;

    let frameworks: Array<FrameworkType> = [
        {
            key: 'svelte',
            label: 'Svelte',
            icon: SvelteFrameworkIcon,
            smallIcon: IconSvelte,
            gitCloneCode:
                '\ngit clone https://github.com/appwrite/starter-for-svelte\ncd starter-for-svelte'
        },
        {
            key: 'react',
            label: 'React',
            icon: ReactFrameworkIcon,
            smallIcon: IconReact,
            gitCloneCode:
                '\ngit clone https://github.com/appwrite/starter-for-react\ncd starter-for-react'
        },
        {
            key: 'nuxt',
            label: 'Nuxt',
            icon: NuxtFrameworkIcon,
            smallIcon: IconNuxt,
            gitCloneCode:
                '\ngit clone https://github.com/appwrite/starter-for-nuxt\ncd starter-for-nuxt'
        },
        {
            key: 'nextjs',
            label: 'Next.js',
            icon: NextjsFrameworkIcon,
            smallIcon: NextjsFrameworkIcon,
            gitCloneCode:
                '\ngit clone https://github.com/appwrite/starter-for-nextjs\ncd starter-for-nextjs'
        },
        {
            key: 'vue',
            label: 'Vue',
            icon: VueFrameworkIcon,
            smallIcon: IconVue,
            gitCloneCode:
                '\ngit clone https://github.com/appwrite/starter-for-vue\ncd starter-for-vue'
        }
    ];

    $: selectedFramework = frameworks.find((framework) => framework.key === selectedFrameworkKey);
    $: selectedFrameworkIcon = selectedFramework ? selectedFramework.icon : NoFrameworkIcon;

    async function createWebPlatform() {
        try {
            isCreatingPlatform = true;
            await sdk.forConsole.projects.createPlatform(
                projectId,
                PlatformType.Web,
                `${selectedFramework.label} app`,
                selectedFrameworkKey,
                undefined,
                undefined
            );

            isPlatformCreated = true;
            trackEvent(Submit.PlatformCreate, {
                type: platform
            });

            await Promise.all([
                invalidate(Dependencies.PROJECT),
                invalidate(Dependencies.PLATFORMS)
            ]);
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
        const unsubscribe = sdk.forConsole.client.subscribe('console', (response) => {
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

<Wizard title="Add web platform" bind:showExitModal confirmExit>
    <Form onSubmit={createWebPlatform}>
        <Layout.Stack gap="xxl">
            <!-- Step One -->
            {#if !isPlatformCreated || isChangingFramework}
                <Fieldset legend="Type">
                    <Layout.Stack>
                        <div class="frameworks">
                            {#each frameworks as framework}
                                <Card.Selector
                                    bind:group={selectedFrameworkKey}
                                    name="framework"
                                    id={framework.key}
                                    value={framework.key}
                                    title={framework.label}
                                    icon={framework.icon}
                                    imageRadius="s" />
                            {/each}
                        </div>

                        <Layout.Stack direction="row" justifyContent="flex-end">
                            {#if isChangingFramework}
                                <Button
                                    fullWidthMobile
                                    size="s"
                                    forceShowLoader
                                    submissionLoader={isCreatingPlatform}
                                    disabled={!selectedFramework}
                                    on:click={() => {
                                        isChangingFramework = false;
                                    }}>
                                    Change framework instructions
                                </Button>
                            {:else}
                                <Button
                                    fullWidthMobile
                                    size="s"
                                    submit
                                    forceShowLoader
                                    submissionLoader={isCreatingPlatform}
                                    disabled={!selectedFramework}>
                                    Create platform
                                </Button>
                            {/if}
                        </Layout.Stack>
                    </Layout.Stack>
                </Fieldset>
            {:else}
                <Card.Base padding="s"
                    ><Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center">
                        <Layout.Stack gap="xxs" direction="row">
                            <Icon icon={selectedFramework.smallIcon} />
                            <Typography.Text variant="m-500"
                                >{selectedFramework.label}</Typography.Text>
                        </Layout.Stack>
                        <ButtonV2.Button
                            variant="secondary"
                            size="s"
                            on:click={() => {
                                isChangingFramework = true;
                            }}>Change</ButtonV2.Button>
                    </Layout.Stack></Card.Base>
            {/if}

            <!-- Step Three -->
            {#if isPlatformCreated && !isChangingFramework}
                <Fieldset legend="Clone starter">
                    <Layout.Stack gap="l">
                        <Typography.Text variant="m-500">
                            1. Clone the starter kit from GitHub using the terminal or VSCode.
                        </Typography.Text>

                        <!-- Temporary fix: Remove this div once Code splitting issue with stack spacing is resolved -->
                        <div class="pink2-code-margin-fix">
                            <Code lang="bash" lineNumbers code={selectedFramework.gitCloneCode} />
                        </div>

                        <Typography.Text variant="m-500"
                            >2. Rename <InlineCode size="s" code=".env.example" /> into <InlineCode
                                size="s"
                                code=".env" /> and update the values.</Typography.Text>

                        <!-- Temporary fix: Remove this div once Code splitting issue with stack spacing is resolved -->
                        <div class="pink2-code-margin-fix">
                            <Code lang="bash" lineNumbers code={updateConfigCode} />
                        </div>

                        <Typography.Text variant="m-500"
                            >3. Install project dependencies</Typography.Text>

                        <!-- Temporary fix: Remove this div once Code splitting issue with stack spacing is resolved -->
                        <div class="pink2-code-margin-fix">
                            <Code lang="bash" lineNumbers code={'npm install'} />
                        </div>

                        <Typography.Text variant="m-500"
                            >3. Run the app, then click the <InlineCode
                                size="s"
                                code="Send a ping" /> button to verify the setup.</Typography.Text>
                    </Layout.Stack>
                </Fieldset>
            {/if}
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Card.Base>
            <Layout.Stack gap="xxl">
                <Layout.Stack direction="row" justifyContent="center" gap="none">
                    <OnboardingPlatformCard iconSize={2.526} icon={selectedFrameworkIcon} />

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
        </Card.Base>
    </svelte:fragment>

    <svelte:fragment slot="footer">
        {#if isPlatformCreated}
            <Button
                size="s"
                fullWidthMobile
                secondary
                disabled={isCreatingPlatform}
                href={location.pathname}>
                Go to dashboard
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

    .frameworks {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--gap-l, 16px);
    }
</style>
