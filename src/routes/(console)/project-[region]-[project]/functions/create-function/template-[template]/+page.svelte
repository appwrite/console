<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Card } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import { Fieldset, Layout, Icon, Divider, Empty, Typography } from '@appwrite.io/pink-svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import ProductionBranch from '$lib/components/git/productionBranchFieldset.svelte';
    import Configuration from './configuration.svelte';
    import { ID, Runtime, type Models } from '@appwrite.io/console';
    import {
        ConnectBehaviour,
        NewRepository,
        Repositories,
        RepositoryBehaviour
    } from '$lib/components/git';
    import { consoleVariables } from '$routes/(console)/store';
    import Details from '../(components)/details.svelte';
    import Aside from '../(components)/aside.svelte';
    import { iconPath } from '$lib/stores/app';
    import Permissions from './permissions.svelte';
    import { connectGitHub } from '$lib/stores/git';
    import RepoCard from './repoCard.svelte';
    import { Dependencies } from '$lib/constants';
    import { getIconFromRuntime } from '$lib/stores/runtimes';

    export let data;

    const specificationOptions = data.specificationsList.specifications.map((size) => ({
        label:
            `${size.cpus} CPU, ${size.memory} MB RAM` +
            (!size.enabled ? ` (Upgrade to use this)` : ''),
        value: size.slug,
        disabled: !size.enabled
    }));

    let showExitModal = false;
    let isCreatingRepository = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = data.template.name;
    let id: string;
    let runtime: Runtime;
    let branch = 'main';
    let rootDir = './';
    let connectBehaviour: 'now' | 'later' = 'now';
    let repositoryBehaviour: 'new' | 'existing' = 'new';
    let repositoryName = undefined;
    let repositoryPrivate = true;
    let selectedInstallationId = '';
    let selectedRepository = '';
    let showConfig = false;
    let silentMode = false;
    let entrypoint = '';
    let selectedScopes: string[] = [];
    let execute = true;
    let variables: Partial<Models.TemplateVariable>[] = [];
    let specification = specificationOptions[0].value;

    onMount(async () => {
        if (!$installation?.$id) {
            $installation = data.installations.installations[0];
        }
        selectedInstallationId = $installation?.$id;
        if (data.template.runtimes && data.template.runtimes.length > 0) {
            const targetRuntime = data.template.runtimes[0].name;
            const matchingRuntimes = Object.values(Runtime).filter((r) =>
                r.startsWith(targetRuntime.split('-')[0])
            );

            matchingRuntimes.sort((a, b) => {
                const versionA = a.split('-')[1];
                const versionB = b.split('-')[1];
                return versionB.localeCompare(versionA, undefined, { numeric: true });
            });
            if (page.url.searchParams.has('runtime')) {
                runtime = page.url.searchParams.get('runtime') as Runtime;
            } else {
                runtime = matchingRuntimes[0] as Runtime;
            }
        }
    });

    async function createRepository() {
        try {
            isCreatingRepository = true;
            const repo = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.createRepository($installation.$id, repositoryName, repositoryPrivate);
            repository.set(repo);
            selectedRepository = repo.id;
            showConfig = true;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            isCreatingRepository = false;
        }
    }

    async function create() {
        if (connectBehaviour === 'now' && !selectedRepository) {
            addNotification({
                type: 'error',
                message: 'Please select a repository'
            });
            return;
        } else {
            try {
                const rt = data.template.runtimes.find((r) => r.name === runtime);

                const func = await sdk
                    .forProject(page.params.region, page.params.project)
                    .functions.create(
                        id || ID.unique(),
                        name,
                        runtime as Runtime,
                        execute && data.template.permissions?.length
                            ? data.template.permissions
                            : undefined,
                        data.template.events?.length ? data.template.events : undefined,
                        data.template.cron || undefined,
                        data.template.timeout ? data.template.timeout : undefined,
                        undefined,
                        undefined,
                        entrypoint || rt?.entrypoint || undefined,
                        rt?.commands || undefined,
                        selectedScopes?.length ? selectedScopes : undefined,
                        connectBehaviour === 'later' ? undefined : $installation?.$id || undefined,
                        connectBehaviour === 'later' ? undefined : $repository?.id || undefined,
                        branch,
                        silentMode,
                        rootDir,
                        specification || undefined
                    );

                // Add domain
                await sdk
                    .forProject(page.params.region, page.params.project)
                    .proxy.createFunctionRule(
                        `${ID.unique()}.${$consoleVariables._APP_DOMAIN_FUNCTIONS}`,
                        func.$id
                    );

                // Add variables
                const promises = variables.map((variable) =>
                    sdk
                        .forProject(page.params.region, page.params.project)
                        .functions.createVariable(
                            func.$id,
                            variable.name,
                            variable.value,
                            variable?.secret ?? false
                        )
                );
                await Promise.all(promises);

                await sdk
                    .forProject(page.params.region, page.params.project)
                    .functions.createTemplateDeployment(
                        func.$id,
                        data.template.providerRepositoryId || undefined,
                        data.template.providerOwner || undefined,
                        rt?.providerRootDirectory || undefined,
                        data.template.providerVersion || undefined,
                        true
                    );

                trackEvent(Submit.FunctionCreate, {
                    runtime: runtime,
                    source: 'template',
                    framework: data.template.name
                });

                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/functions/function-${func.$id}`
                );
                invalidate(Dependencies.FUNCTION);
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                trackError(e, Submit.FunctionCreate);
            }
        }
    }

    $: if (repositoryBehaviour === 'new') {
        selectedInstallationId ??= $installation?.$id;
        repositoryName ??= name.split(' ').join('-').toLowerCase();
    }

    $: if (connectBehaviour === 'later') {
        selectedRepository = null;
    }

    $: availableRuntimes = data.runtimesList.runtimes.filter((runtime) =>
        data.template.runtimes.some((templateRuntime) => templateRuntime.name === runtime.$id)
    );
</script>

<svelte:head>
    <title>Create function - Appwrite</title>
</svelte:head>

<Wizard
    title="Create function"
    bind:showExitModal
    href={`${base}/project-${page.params.region}-${page.params.project}/functions`}
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xl">
            {#if selectedRepository && showConfig}
                <Layout.Stack gap="xxl">
                    <RepoCard bind:showConfig />

                    <ProductionBranch
                        bind:branch
                        bind:rootDir
                        bind:silentMode
                        product="functions"
                        installationId={selectedInstallationId}
                        repositoryId={selectedRepository} />

                    {#if data.template.variables?.length}
                        <Configuration bind:variables templateVariables={data.template.variables} />
                    {/if}
                </Layout.Stack>
            {:else}
                {@const options = availableRuntimes.map((runtime) => {
                    return {
                        value: runtime.$id,
                        label: `${runtime.name} - ${runtime.version}`,
                        leadingHtml: `<img src='${$iconPath(getIconFromRuntime(runtime.$id), 'color')}' style='inline-size: var(--icon-size-m)' />`
                    };
                })}

                <Layout.Stack gap="xxl">
                    <Details
                        bind:name
                        bind:id
                        bind:runtime
                        bind:entrypoint
                        bind:specification
                        {specificationOptions}
                        {options} />
                    <Permissions
                        templateScopes={data.template.scopes}
                        bind:selectedScopes
                        bind:execute />

                    <ConnectBehaviour bind:connectBehaviour />
                </Layout.Stack>
                {#if connectBehaviour === 'now'}
                    {#if !!data?.installations?.total}
                        <Fieldset legend="Git repository">
                            <Layout.Stack gap="xl">
                                <RepositoryBehaviour bind:repositoryBehaviour />
                                {#if repositoryBehaviour === 'new'}
                                    <NewRepository
                                        bind:selectedInstallationId
                                        disableFields={isCreatingRepository}
                                        installations={data.installations}
                                        bind:repositoryName
                                        bind:repositoryPrivate />
                                    <Layout.Stack gap="xl" alignItems="flex-end">
                                        <Divider />

                                        <Button
                                            size="s"
                                            on:click={createRepository}
                                            forceShowLoader
                                            submissionLoader={isCreatingRepository}
                                            disabled={!repositoryName ||
                                                !$installation?.$id ||
                                                isCreatingRepository}>
                                            Create
                                        </Button>
                                    </Layout.Stack>
                                {:else}
                                    <Repositories
                                        bind:selectedRepository
                                        action="button"
                                        connect={(e) => {
                                            trackEvent(Click.ConnectRepositoryClick, {
                                                from: 'template-wizard'
                                            });
                                            repository.set(e);
                                            repositoryName = e.name;
                                            selectedRepository = e.id;
                                            showConfig = true;
                                        }} />
                                {/if}
                            </Layout.Stack>
                        </Fieldset>
                    {:else}
                        <Card isDashed padding="none">
                            <Empty
                                type="secondary"
                                title="Connect Git repository"
                                description="Create and deploy a Site with a connected git repository.">
                                <svelte:fragment slot="actions">
                                    <Button secondary href={connectGitHub().toString()} size="s">
                                        <Icon icon={IconGithub} slot="start" />
                                        Connect to GitHub
                                    </Button>
                                </svelte:fragment>
                            </Empty>
                        </Card>
                    {/if}
                {:else if data.template.variables?.length}
                    <Configuration bind:variables templateVariables={data.template.variables} />
                {/if}
            {/if}
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside
            {runtime}
            {repositoryName}
            {branch}
            {rootDir}
            runtimes={data.runtimesList}
            bind:showGitData={showConfig}>
            <Layout.Stack gap="xxxs">
                <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                    {data.template.name}
                </Typography.Text>
                <Typography.Text>
                    {data.template.tagline}
                </Typography.Text>
            </Layout.Stack>
        </Aside>
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile size="s" secondary on:click={() => (showExitModal = true)}>
            Cancel
        </Button>
        <Button
            fullWidthMobile
            size="s"
            on:click={() => {
                if (variables.filter((v) => v.required && !v.value).length) {
                    addNotification({
                        type: 'error',
                        message:
                            'Missing required environment variables. Please update and try again.'
                    });
                } else {
                    formComponent.triggerSubmit();
                }
            }}
            disabled={$isSubmitting || (connectBehaviour === 'now' && !selectedRepository)}>
            Deploy
        </Button>
    </svelte:fragment>
</Wizard>
