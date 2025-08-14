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
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import Domain from '../domain.svelte';
    import { Adapter, BuildRuntime, Framework, ID } from '@appwrite.io/console';
    import { CustomId } from '$lib/components';
    import { getFrameworkIcon } from '$lib/stores/sites';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { iconPath } from '$lib/stores/app';
    import type { PageData } from './$types';

    export let data: PageData;

    let showExitModal = false;
    let showCustomId = false;
    let formComponent: Form;
    let isSubmitting = writable(false);

    // State variables
    let name = '';
    let id = '';
    let domain = '';
    let domainIsValid = true;
    let framework: Framework = Framework.Nextjs;
    let branch = '';
    let rootDir = '';
    let variables: Array<{ key: string; value: string; secret: boolean }> = [];
    let installCommand = '';
    let buildCommand = '';
    let outputDirectory = '';

    // Track if we have custom commands from URL
    let hasCustomCommands = false;

    onMount(() => {
        // Initialize default values
        name = data.repository.name;
        id = ID.unique();
        domain = data.repository.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

        // Get URL params
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

        // Initialize environment variables from query params
        if (data.envKeys.length > 0) {
            variables = data.envKeys.map((key) => ({ key, value: '', secret: false }));
        }
    });

    // Framework options - dynamically generate from enum
    const frameworkOptions = Object.values(Framework).map((fw) => ({
        key: fw,
        name:
            fw === Framework.Nextjs
                ? 'Next.js'
                : fw === Framework.Sveltekit
                  ? 'SvelteKit'
                  : fw.charAt(0).toUpperCase() + fw.slice(1),
        buildRuntime: fw === Framework.Other ? BuildRuntime.Static1 : BuildRuntime.Node210
    }));

    $: selectedFramework = frameworkOptions.find((f) => f.key === framework) || frameworkOptions[0];

    // Update build commands when framework changes (only if not provided via URL)
    $: if (framework && data.frameworks && !hasCustomCommands) {
        const fw = data.frameworks.frameworks.find((f) => f.key === framework);
        if (fw && fw.adapters && fw.adapters.length > 0) {
            const adapter = fw.adapters[0];
            installCommand = adapter.installCommand || '';
            buildCommand = adapter.buildCommand || '';
            outputDirectory = adapter.outputDirectory || '';
        }
    }

    async function create() {
        if (!domainIsValid) {
            addNotification({
                type: 'error',
                message: 'Domain is not valid'
            });
            return;
        }

        try {
            // Create site with build configuration
            let site = await sdk.forProject(page.params.region, page.params.project).sites.create(
                id || ID.unique(),
                name,
                framework,
                selectedFramework.buildRuntime,
                undefined, // enabled
                undefined, // logging
                undefined, // timeout
                installCommand || undefined,
                buildCommand || undefined,
                outputDirectory || undefined,
                framework === Framework.Other ? Adapter.Static : undefined, // adapter
                undefined, // installationId
                undefined, // fallbackFile
                undefined, // providerRepositoryId
                undefined, // branch
                false, // silentMode
                rootDir || undefined
            );

            // Add domain
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.createSiteRule(
                    `${domain}.${$regionalConsoleVariables._APP_DOMAIN_SITES}`,
                    site.$id
                );

            // Add variables
            const promises = variables.map((variable) =>
                sdk
                    .forProject(page.params.region, page.params.project)
                    .sites.createVariable(site.$id, variable.key, variable.value, variable.secret)
            );
            await Promise.all(promises);

            // Fetch tags from GitHub API
            let latestTag = '';
            try {
                const tagsResponse = await fetch(
                    `https://api.github.com/repos/${data.repository.owner}/${data.repository.name}/tags`
                );
                if (tagsResponse.ok) {
                    const tags = await tagsResponse.json();
                    if (tags.length > 0) {
                        latestTag = tags[0].name;
                    } else {
                        addNotification({
                            type: 'error',
                            message:
                                'No tags found in repository. Please create a tag before deploying.'
                        });
                        return;
                    }
                } else {
                    addNotification({
                        type: 'error',
                        message: 'Failed to fetch tags from GitHub.'
                    });
                    return;
                }
            } catch (error) {
                addNotification({
                    type: 'error',
                    message: 'Failed to fetch tags from GitHub: ' + error.message
                });
                return;
            }

            // Create deployment from GitHub repository using the latest tag
            const deployment = await sdk
                .forProject(page.params.region, page.params.project)
                .sites.createTemplateDeployment(
                    site.$id,
                    data.repository.name,
                    data.repository.owner,
                    rootDir || '.',
                    latestTag,
                    true
                );

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
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
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
                                <Tag size="s" on:click={() => (showCustomId = !showCustomId)}>
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
                        options={frameworkOptions.map((fw) => ({
                            value: fw.key,
                            label: fw.name,
                            leadingHtml: `<img src='${$iconPath(getFrameworkIcon(fw.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
                        }))} />
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Git configuration">
                <Layout.Stack gap="m">
                    <Input.Text
                        label="Production branch"
                        placeholder="Leave empty to use default branch"
                        bind:value={branch} />
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
                                <div
                                    style="display: flex; flex-direction: column; gap: 0.25rem; min-width: 80px; align-items: center;">
                                    {#if i === 0}
                                        <span
                                            style="font-size: 0.875rem; color: var(--color-neutral-70);"
                                            >Secret</span>
                                    {/if}
                                    <div
                                        style="height: 2.5rem; display: flex; align-items: center; justify-content: center;">
                                        <Selector.Checkbox
                                            size="s"
                                            id="secret-{i}"
                                            bind:checked={variable.secret} />
                                    </div>
                                </div>
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
            disabled={$isSubmitting || !domainIsValid}>
            Deploy
        </Button>
    </svelte:fragment>
</Wizard>
