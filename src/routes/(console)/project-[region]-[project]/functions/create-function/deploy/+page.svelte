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
    import { Fieldset, Layout, Icon, Input, Tag } from '@appwrite.io/pink-svelte';
    import { IconGithub, IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import { ID, Runtime, Type } from '@appwrite.io/console';
    import { CustomId } from '$lib/components';
    import { getIconFromRuntime } from '$lib/stores/runtimes';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { iconPath } from '$lib/stores/app';
    import type { PageData } from './$types';
    import { getDefaultBranch, getBranches, validateBranch } from '$lib/helpers/github';
    import { writable } from 'svelte/store';
    import Link from '$lib/elements/link.svelte';

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
    let branches = $state<string[]>([]);
    let selectedBranch = $state<string>('');
    let loadingBranches = $state(false);

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

    onMount(async () => {
        const runtimeParam = data.runtime || page.url.searchParams.get('runtime') || Runtime.Node22;
        runtime = runtimeParam as Runtime;

        entrypoint = page.url.searchParams.get('entrypoint') || '';

        installCommand = page.url.searchParams.get('install') || '';
        rootDir = page.url.searchParams.get('rootDir') || data.repository?.rootDirectory || './';

        if (specificationOptions.length > 0) {
            specification = specificationOptions[0].value;
        }

        // Initialize environment variables from query params (with prefilled values if provided)
        if (data.envVars.length > 0) {
            variables = data.envVars.map((env) => ({
                key: env.key,
                value: env.value,
                secret: false
            }));
        }

        // Load branches and set default branch
        if (data.repository?.owner && data.repository?.name) {
            loadingBranches = true;
            try {
                // Check for branch param from URL
                const branchParam = page.url.searchParams.get('branch');

                const [branchList, defaultBranch, isBranchValid] = await Promise.all([
                    getBranches(data.repository.owner, data.repository.name),
                    getDefaultBranch(data.repository.owner, data.repository.name),
                    branchParam
                        ? validateBranch(data.repository.owner, data.repository.name, branchParam)
                        : Promise.resolve(false)
                ]);

                if (branchList && branchList.length > 0) {
                    branches = branchList;

                    if (branchParam && isBranchValid) {
                        // Use the provided branch if it's valid
                        selectedBranch = branchParam;
                    } else {
                        // Fall back to default branch, or first branch if default not found
                        selectedBranch =
                            defaultBranch && branchList.includes(defaultBranch)
                                ? defaultBranch
                                : branchList[0];
                    }
                } else {
                    // Branch list is empty or null
                    addNotification({
                        type: 'error',
                        message:
                            'Failed to load branches from repository. Please check the repository URL or try again.'
                    });
                }
            } catch (error) {
                addNotification({
                    type: 'error',
                    message:
                        'Failed to load branches from repository. Please check the repository URL or try again.'
                });
            } finally {
                loadingBranches = false;
            }
        } else {
            // Repository info is missing
            addNotification({
                type: 'error',
                message: 'Repository information is missing. Please check the repository URL.'
            });
        }
    });

    async function create() {
        if (!selectedBranch || branches.length === 0) {
            addNotification({
                type: 'error',
                message: 'Please wait for branches to load or check the repository URL.'
            });
            return;
        }

        $isSubmitting = true;

        try {
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

            // Create deployment from GitHub repository using the selected branch
            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.createTemplateDeployment({
                    functionId: func.$id,
                    repository: data.repository.name,
                    owner: data.repository.owner,
                    rootDirectory: rootDir || '.',
                    type: Type.Branch,
                    reference: selectedBranch,
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
    columnSize="s"
    column={true}
    bind:showExitModal
    href={`${base}/project-${page.params.region}-${page.params.project}/functions/`}
    confirmExit>
    <Form onSubmit={create} {isSubmitting}>
        <Layout.Stack gap="xl">
            <Card padding="s" radius="s">
                <Layout.Stack direction="row" alignItems="center" gap="s">
                    <Icon icon={IconGithub} />
                    <Link variant="quiet" href={data.repository.url} size="m" external icon>
                        {data.repository.owner}/{data.repository.name}
                    </Link>
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

            <Fieldset legend="Git configuration">
                <Layout.Stack gap="m">
                    <Input.Select
                        id="branch"
                        label="Branch"
                        required
                        placeholder={loadingBranches ? 'Loading branches...' : 'Select branch'}
                        bind:value={selectedBranch}
                        disabled={loadingBranches}
                        options={branches.map((branch) => ({
                            value: branch,
                            label: branch
                        }))} />
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

            {#if data.envVars.length > 0}
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
                <Button
                    submit
                    fullWidthMobile
                    submissionLoader
                    forceShowLoader={$isSubmitting}
                    disabled={!name ||
                        !runtime ||
                        !specification ||
                        !selectedBranch ||
                        branches.length === 0 ||
                        $isSubmitting}>
                    Deploy function
                </Button>
            </Layout.Stack>
        </Layout.Stack>
    </Form>
</Wizard>
