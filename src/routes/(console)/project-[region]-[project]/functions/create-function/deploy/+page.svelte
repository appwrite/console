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
    import { ID, Runtime } from '@appwrite.io/console';
    import { CustomId } from '$lib/components';
    import { getIconFromRuntime } from '$lib/stores/runtimes';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { iconPath } from '$lib/stores/app';
    import type { PageData } from './$types';
    import { getLatestTag } from '$lib/helpers/github';
    import { writable } from 'svelte/store';

    let {
        data
    }: {
        data: PageData;
    } = $props();

    let showExitModal = $state(false);
    let showCustomId = $state(false);
    let isSubmitting = $state(writable(false));

    let id = $state(ID.unique());
    let name = $state(data.repository.name);

    let execute = $state(true);
    let entrypoint = $state('');
    let specification = $state('');
    let runtime = $state<Runtime>();
    let installCommand = $state('');
    let selectedScopes = $state<string[]>([]);
    let rootDir = $state(data.repository?.rootDirectory);
    let variables = $state<Array<{ key: string; value: string; secret: boolean }>>([]);

    let latestTag = $state(null);

    const specificationOptions = $derived(
        data.specificationsList?.specifications?.map((size) => ({
            label:
                `${size.cpus} CPU, ${size.memory} MB RAM` +
                (!size.enabled ? ` (Upgrade to use this)` : ''),
            value: size.slug,
            disabled: !size.enabled
        })) || []
    );

    const runtimeOptions = $derived(
        data.runtimesList?.runtimes?.map((r) => ({
            value: r.$id,
            label: `${r.name} - ${r.version}`,
            leadingHtml: `<img src='${$iconPath(getIconFromRuntime(r.$id), 'color')}' style='inline-size: var(--icon-size-m)' />`
        })) || []
    );

    onMount(() => {
        const runtimeParam = data.runtime || page.url.searchParams.get('runtime') || 'node-18.0';
        runtime = runtimeParam as Runtime;

        entrypoint = page.url.searchParams.get('entrypoint') || '';

        installCommand = page.url.searchParams.get('install') || '';
        rootDir = page.url.searchParams.get('rootDir') || data.repository?.rootDirectory || './';

        if (specificationOptions.length > 0) {
            specification = specificationOptions[0].value;
        }

        if (data.envKeys.length > 0) {
            variables = data.envKeys.map((key) => ({ key, value: '', secret: false }));
        }

        getLatestTag(data.repository.owner, data.repository.name).then(
            (tagName) => (latestTag = tagName)
        );
    });

    async function create() {
        $isSubmitting = true;

        try {
            if (!latestTag) {
                latestTag = await getLatestTag(data.repository.owner, data.repository.name);
            }

            // Create function with configuration
            const func = await sdk
                .forProject(page.params.region, page.params.project)
                .functions.create({
                    functionId: id || ID.unique(),
                    name,
                    runtime,
                    execute: execute ? ['any'] : undefined,
                    entrypoint: entrypoint || undefined,
                    commands: installCommand || undefined,
                    scopes: selectedScopes?.length ? selectedScopes : undefined,
                    providerSilentMode: false,
                    specification: specification || undefined
                });

            // Add domain
            await sdk.forProject(page.params.region, page.params.project).proxy.createFunctionRule({
                domain: `${ID.unique()}.${$regionalConsoleVariables._APP_DOMAIN_FUNCTIONS}`,
                functionId: func.$id
            });

            // Add variables
            const promises = variables.map((variable) =>
                sdk.forProject(page.params.region, page.params.project).functions.createVariable({
                    functionId: func.$id,
                    key: variable.key,
                    value: variable.value,
                    secret: variable.secret
                })
            );

            await Promise.all(promises);

            // Create deployment from GitHub repository using the latest tag
            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.createTemplateDeployment({
                    functionId: func.$id,
                    repository: data.repository.name,
                    owner: data.repository.owner,
                    rootDirectory: rootDir || '.',
                    version: latestTag ?? '1.0.0',
                    activate: true
                });

            trackEvent(Submit.FunctionCreate, {
                source: 'deploy-button',
                runtime: runtime!,
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
        } finally {
            $isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Deploy {data.repository.name} - Appwrite</title>
</svelte:head>

<Wizard
    title="Deploy function"
    bind:showExitModal
    href={`${base}/project-${page.params.region}-${page.params.project}/functions/`}
    confirmExit>
    <Form onSubmit={create} {isSubmitting}>
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
                                <Tag size="s" onclick={() => (showCustomId = !showCustomId)}>
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
                        id="installCommand"
                        name="installCommand"
                        bind:value={installCommand}
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
