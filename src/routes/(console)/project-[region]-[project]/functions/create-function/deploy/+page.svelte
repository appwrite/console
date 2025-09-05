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
    import { ID, Runtime } from '@appwrite.io/console';
    import { CustomId } from '$lib/components';
    import { getIconFromRuntime } from '$lib/stores/runtimes';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { iconPath } from '$lib/stores/app';
    import type { PageData } from './$types';

    export let data: PageData;

    let showExitModal = false;
    let showCustomId = false;
    let isSubmitting = writable(false);

    // State variables
    let name = '';
    let id = '';
    let runtime: Runtime;
    let entrypoint = '';
    let buildCommand = ''; // This is the install command in the UI
    let rootDir = './';
    let variables: Array<{ key: string; value: string; secret: boolean }> = [];
    let specification = '';
    let execute = true;
    let selectedScopes: string[] = [];

    // Track the latest tag (needed for deployment, but not shown in UI)
    let latestTag = '';

    const specificationOptions =
        data.specificationsList?.specifications?.map((size) => ({
            label:
                `${size.cpus} CPU, ${size.memory} MB RAM` +
                (!size.enabled ? ` (Upgrade to use this)` : ''),
            value: size.slug,
            disabled: !size.enabled
        })) || [];

    onMount(() => {
        // Initialize default values
        name = data.repository.name;
        id = ID.unique();

        // Get URL params
        const runtimeParam = data.runtime || page.url.searchParams.get('runtime') || 'node-18.0';
        runtime = runtimeParam as Runtime;

        // Build configuration - use from URL params or defaults
        entrypoint = page.url.searchParams.get('entrypoint') || '';
        buildCommand = page.url.searchParams.get('install') || ''; // Using 'install' param for consistency with sites
        rootDir = page.url.searchParams.get('rootDir') || './';

        // Set default specification
        if (specificationOptions.length > 0) {
            specification = specificationOptions[0].value;
        }

        // Initialize environment variables from query params
        if (data.envKeys.length > 0) {
            variables = data.envKeys.map((key) => ({ key, value: '', secret: false }));
        }

        // Fetch latest tag in the background (needed for deployment)
        fetchLatestGitHubTag();
    });

    async function fetchLatestGitHubTag(): Promise<void> {
        try {
            const tagsResponse = await fetch(
                `https://api.github.com/repos/${data.repository.owner}/${data.repository.name}/tags`
            );

            if (!tagsResponse.ok) {
                console.error('Failed to fetch tags from GitHub');
                return;
            }

            const tags = await tagsResponse.json();
            if (tags.length > 0) {
                latestTag = tags[0].name;
            }
        } catch (error) {
            console.error('Failed to fetch tags from GitHub:', error);
        }
    }

    async function create() {
        // If no tag was fetched, try to get it now
        if (!latestTag) {
            await fetchLatestGitHubTag();
        }

        if (!latestTag) {
            addNotification({
                type: 'error',
                message: 'No tag available for deployment. Please create a tag in your repository.'
            });
            return;
        }

        try {
            // Create function with configuration
            const func = await sdk
                .forProject(page.params.region, page.params.project)
                .functions.create(
                    id || ID.unique(),
                    name,
                    runtime,
                    execute ? ['any'] : undefined, // Default permissions
                    undefined, // events
                    undefined, // cron
                    undefined, // timeout
                    undefined, // enabled
                    undefined, // logging
                    entrypoint || undefined,
                    buildCommand || undefined, // This is the commands parameter
                    selectedScopes?.length ? selectedScopes : undefined,
                    undefined, // installationId - will be null for repo deployments without VCS
                    undefined, // repositoryId
                    undefined, // branch
                    false, // silentMode
                    undefined, // rootDir
                    specification || undefined
                );

            // Add domain
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.createFunctionRule(
                    `${ID.unique()}.${$regionalConsoleVariables._APP_DOMAIN_FUNCTIONS}`,
                    func.$id
                );

            // Add variables
            const promises = variables.map((variable) =>
                sdk
                    .forProject(page.params.region, page.params.project)
                    .functions.createVariable(
                        func.$id,
                        variable.key,
                        variable.value,
                        variable.secret
                    )
            );
            await Promise.all(promises);

            // Create deployment from GitHub repository using the latest tag
            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.createTemplateDeployment(
                    func.$id,
                    data.repository.name,
                    data.repository.owner,
                    rootDir || '.',
                    latestTag,
                    true
                );

            trackEvent(Submit.FunctionCreate, {
                source: 'deploy-button',
                runtime: runtime,
                repository: data.repository.url
            });

            await goto(
                `${base}/project-${page.params.region}-${page.params.project}/functions/function-${func.$id}`
            );
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.FunctionCreate);
        }
    }

    // Runtime options
    const runtimeOptions =
        data.runtimesList?.runtimes?.map((r) => ({
            value: r.$id,
            label: `${r.name} - ${r.version}`,
            leadingHtml: `<img src='${$iconPath(getIconFromRuntime(r.$id), 'color')}' style='inline-size: var(--icon-size-m)' />`
        })) || [];
</script>

<svelte:head>
    <title>Deploy {data.repository.name} - Appwrite</title>
</svelte:head>

<Wizard
    title="Deploy function"
    bind:showExitModal
    href={`${base}/project-${page.params.region}-${page.params.project}/functions/`}
    confirmExit>
    <Form onSubmit={create} bind:isSubmitting>
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
                            <CustomId bind:id bind:show={showCustomId} name="Function" />
                        {:else}
                            <div>
                                <Tag size="s" on:click={() => (showCustomId = !showCustomId)}>
                                    <Icon icon={IconPencil} size="s" />
                                    Function ID
                                </Tag>
                            </div>
                        {/if}
                    </Layout.Stack>
                    <Input.Select
                        id="runtime"
                        label="Runtime"
                        placeholder="Select runtime"
                        bind:value={runtime}
                        required
                        options={runtimeOptions} />
                    <Input.Select
                        id="specification"
                        label="Specification"
                        placeholder="Select specification"
                        bind:value={specification}
                        required
                        options={specificationOptions} />
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Build configuration">
                <Layout.Stack gap="m">
                    <Input.Text
                        label="Root directory"
                        id="rootDir"
                        name="rootDir"
                        bind:value={rootDir}
                        placeholder="./" />
                    <Input.Text
                        label="Entrypoint"
                        id="entrypoint"
                        name="entrypoint"
                        bind:value={entrypoint}
                        placeholder="e.g., index.js, main.py" />
                    <Input.Text
                        label="Install command"
                        id="buildCommand"
                        name="buildCommand"
                        bind:value={buildCommand}
                        placeholder="e.g., npm install" />
                </Layout.Stack>
            </Fieldset>

            {#if data.envKeys.length > 0}
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

            <Layout.Stack direction="row" justifyContent="space-between">
                <Button
                    secondary
                    href={`${base}/project-${page.params.region}-${page.params.project}/functions`}>
                    Cancel
                </Button>
                <Button submit disabled={!name || !runtime || !specification}>
                    Deploy function
                </Button>
            </Layout.Stack>
        </Layout.Stack>
    </Form>
</Wizard>
