<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Card } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import {
        Fieldset,
        Layout,
        Icon,
        Typography,
        Input,
        Tag,
        Selector
    } from '@appwrite.io/pink-svelte';
    import { IconGithub, IconExternalLink, IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import Domain from '../domain.svelte';
    import { Adapter, BuildRuntime, Framework, ID } from '@appwrite.io/console';
    import { CustomId } from '$lib/components';
    import { getFrameworkIcon } from '$lib/stores/sites';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { iconPath } from '$lib/stores/app';
    import type { PageData } from './$types';
    import { writable } from 'svelte/store';
    import { getLatestTag } from '$lib/helpers/github';

    let {
        data
    }: {
        data: PageData;
    } = $props();

    let showCustomId = $state(false);
    let showExitModal = $state(false);
    let formComponent = $state<Form>();
    let isSubmitting = $state(writable(false));

    let id = $state(ID.unique());
    let name = $state(data.repository?.name || '');

    let domain = $state('');
    let rootDir = $state(data.repository?.rootDirectory || '');
    let buildCommand = $state('');
    let installCommand = $state('');
    let outputDirectory = $state('');
    let domainIsValid = $state(false);
    let framework = $state<Framework>(Framework.Nextjs);
    let variables = $state<Array<{ key: string; value: string; secret: boolean }>>([]);

    // Track if we have custom commands from URL
    let hasCustomCommands = $state(false);

    // Framework options - dynamically generate from enum
    const frameworkOptions = $derived(
        Object.values(Framework).map((fw) => ({
            key: fw,
            name:
                fw === Framework.Nextjs
                    ? 'Next.js'
                    : fw === Framework.Sveltekit
                      ? 'SvelteKit'
                      : fw.charAt(0).toUpperCase() + fw.slice(1),
            buildRuntime: fw === Framework.Other ? BuildRuntime.Static1 : BuildRuntime.Node210
        }))
    );

    const selectedFramework = $derived(
        frameworkOptions.find((f) => f.key === framework) || frameworkOptions[0]
    );

    const frameworkSelectOptions = $derived(
        frameworkOptions.map((fw) => ({
            value: fw.key,
            label: fw.name,
            leadingHtml: `<img src='${$iconPath(getFrameworkIcon(fw.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
        }))
    );

    $effect(() => {
        if (framework && data.frameworks && !hasCustomCommands) {
            const fw = data.frameworks.frameworks.find((f) => f.key === framework);
            if (fw && fw.adapters && fw.adapters.length > 0) {
                const adapter = fw.adapters[0];
                installCommand = adapter.installCommand || '';
                buildCommand = adapter.buildCommand || '';
                outputDirectory = adapter.outputDirectory || '';
            }
        }
    });

    onMount(() => {
        const preset = page.url.searchParams.get('preset') || 'nextjs';

        // Map preset string to Framework enum
        framework = (Object.values(Framework) as string[]).includes(preset.toLowerCase())
            ? (preset.toLowerCase() as Framework)
            : Framework.Nextjs;

        // Build configuration - use from URL params or defaults
        installCommand = page.url.searchParams.get('install') || '';
        buildCommand = page.url.searchParams.get('build') || '';
        outputDirectory = page.url.searchParams.get('output') || '';

        // Check if custom commands were provided via URL
        hasCustomCommands = !!(installCommand || buildCommand || outputDirectory);

        // If no custom commands, auto-fill from framework defaults
        if (!hasCustomCommands && data.frameworks) {
            const fw = data.frameworks.frameworks.find((f) => f.key === framework);
            if (fw && fw.adapters && fw.adapters.length > 0) {
                const adapter = fw.adapters[0];
                installCommand = adapter.installCommand || '';
                buildCommand = adapter.buildCommand || '';
                outputDirectory = adapter.outputDirectory || '';
            }
        }

        // Initialize environment variables from query params
        if (data.envKeys.length > 0) {
            variables = data.envKeys.map((key) => ({ key, value: '', secret: false }));
        }
    });

    async function create() {
        if (!domainIsValid) {
            addNotification({
                type: 'error',
                message: 'Domain is not valid'
            });
            return;
        }

        $isSubmitting = true;

        try {
            // Create site with build configuration
            let site = await sdk.forProject(page.params.region, page.params.project).sites.create({
                siteId: id || ID.unique(),
                name,
                framework,
                buildRuntime: selectedFramework.buildRuntime,
                installCommand: installCommand || undefined,
                buildCommand: buildCommand || undefined,
                outputDirectory: outputDirectory || undefined,
                adapter: framework === Framework.Other ? Adapter.Static : undefined,
                providerSilentMode: false
            });

            // Add domain
            await sdk.forProject(page.params.region, page.params.project).proxy.createSiteRule({
                domain: `${domain}.${$regionalConsoleVariables._APP_DOMAIN_SITES}`,
                siteId: site.$id
            });

            // Add variables
            const promises = variables.map((variable) =>
                sdk.forProject(page.params.region, page.params.project).sites.createVariable({
                    siteId: site.$id,
                    key: variable.key,
                    value: variable.value,
                    secret: variable.secret
                })
            );
            await Promise.all(promises);

            // Fetch latest tag from GitHub
            const latestTag = await getLatestTag(data.repository.owner, data.repository.name);

            // Create deployment from GitHub repository using the latest tag
            const deployment = await sdk
                .forProject(page.params.region, page.params.project)
                .sites.createTemplateDeployment({
                    siteId: site.$id,
                    repository: data.repository.name,
                    owner: data.repository.owner,
                    rootDirectory: rootDir || '.',
                    version: latestTag ?? '1.0.0',
                    activate: true
                });

            trackEvent(Submit.SiteCreate, {
                source: 'deploy-button',
                framework: framework,
                repository: data.repository.url
            });

            await goto(
                `${base}/project-${page.params.region}-${page.params.project}/sites/create-site/deploying?site=${site.$id}&deployment=${deployment.$id}`
            );
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.SiteCreate);
        } finally {
            $isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Deploy {data.repository.name} - Appwrite</title>
</svelte:head>

<Wizard
    title="Deploy site"
    bind:showExitModal
    href={`${base}/project-${page.params.region}-${page.params.project}/sites/`}
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} {isSubmitting}>
        <Layout.Stack gap="xl">
            <Card padding="s" radius="s">
                <Layout.Stack gap="m">
                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                        Repository
                    </Typography.Text>
                    <Layout.Stack direction="row" alignItems="center" gap="s">
                        <Icon icon={IconGithub} size="m" />
                        <Typography.Text variant="m-400">
                            {data.repository.owner}/{data.repository.name}
                        </Typography.Text>
                        <Button secondary size="s" external href={data.repository.url}>
                            <Icon icon={IconExternalLink} slot="end" size="s" />
                        </Button>
                    </Layout.Stack>
                </Layout.Stack>
            </Card>

            <Fieldset legend="Details">
                <Layout.Stack gap="l">
                    <Layout.Stack gap="s">
                        <Input.Text
                            label="Name"
                            id="name"
                            name="name"
                            bind:value={name}
                            required
                            placeholder="Enter name" />
                        {#if showCustomId}
                            <CustomId bind:id bind:show={showCustomId} name="Site" />
                        {:else}
                            <div>
                                <Tag size="s" onclick={() => (showCustomId = !showCustomId)}>
                                    <Icon icon={IconPencil} size="s" />
                                    Site ID
                                </Tag>
                            </div>
                        {/if}
                    </Layout.Stack>
                    <Input.Select
                        id="framework"
                        label="Framework"
                        placeholder="Select framework"
                        bind:value={framework}
                        options={frameworkSelectOptions} />
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Git configuration">
                <Layout.Stack gap="m">
                    <Input.Text label="Root directory" placeholder="./" bind:value={rootDir} />
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Build configuration">
                <Layout.Stack gap="m">
                    <Input.Text
                        label="Install command"
                        placeholder={installCommand || 'npm install'}
                        bind:value={installCommand} />
                    <Input.Text
                        label="Build command"
                        placeholder={buildCommand || 'npm run build'}
                        bind:value={buildCommand} />
                    <Input.Text
                        label="Output directory"
                        placeholder={outputDirectory || 'dist'}
                        bind:value={outputDirectory} />
                </Layout.Stack>
            </Fieldset>

            {#if variables.length > 0}
                <Fieldset legend="Environment variables">
                    <Layout.Stack gap="m">
                        {#each variables as variable, i}
                            <Layout.Stack direction="row" gap="s" alignItems="flex-end">
                                <Input.Text
                                    label={i === 0 ? 'Key' : null}
                                    value={variable.key}
                                    readonly
                                    style="flex: 1" />
                                <Input.Text
                                    label={i === 0 ? 'Value' : null}
                                    placeholder="Enter value"
                                    required
                                    bind:value={variable.value}
                                    style="flex: 2" />
                                <Layout.Stack
                                    direction="column"
                                    gap="s"
                                    alignItems="center"
                                    style="max-width: 60px;">
                                    {#if i === 0}
                                        <Typography.Text variant="m-500">Secret</Typography.Text>
                                    {/if}

                                    <Layout.Stack
                                        direction="row"
                                        gap="s"
                                        alignItems="center"
                                        justifyContent="center"
                                        height="2.5rem">
                                        <Selector.Checkbox
                                            size="s"
                                            id="secret-{i}"
                                            bind:checked={variable.secret} />
                                    </Layout.Stack>
                                </Layout.Stack>
                            </Layout.Stack>
                        {/each}
                    </Layout.Stack>
                </Fieldset>
            {/if}

            <Domain bind:domain bind:domainIsValid />

            {#if !data.installations?.total}
                <Card isDashed padding="xs">
                    <Layout.Stack direction="row" gap="s" alignItems="center">
                        <Icon icon={IconGithub} size="m" />
                        <Typography.Text variant="m-400">
                            Note: You can connect your GitHub account later to enable automatic
                            deployments
                        </Typography.Text>
                    </Layout.Stack>
                </Card>
            {/if}
        </Layout.Stack>
    </Form>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile size="s" secondary on:click={() => (showExitModal = true)}>
            Cancel
        </Button>
        <Button
            fullWidthMobile
            size="s"
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting || !domainIsValid || !domain}>
            Deploy
        </Button>
    </svelte:fragment>
</Wizard>
