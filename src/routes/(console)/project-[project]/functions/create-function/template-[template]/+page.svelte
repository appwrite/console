<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Card } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository, sortBranches } from '$lib/stores/vcs';
    import { Fieldset, Layout, Icon, Divider, Empty, Typography } from '@appwrite.io/pink-svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import ConnectBehaviour from './connectBehaviour.svelte';
    import ProductionBranch from '$lib/components/git/productionBranchFieldset.svelte';
    import Configuration from './configuration.svelte';
    import { ID, Runtime, Type, type Models } from '@appwrite.io/console';
    import { NewRepository, Repositories, RepositoryBehaviour } from '$lib/components/git';
    import { consoleVariables } from '$routes/(console)/store';
    import Details from '../(components)/details.svelte';
    import Aside from '../(components)/aside.svelte';
    import { iconPath } from '$lib/stores/app';
    import { getIconFromRuntime } from '../../store';
    import Permissions from './permissions.svelte';
    import { connectGitHub } from '$lib/stores/git';

    export let data;

    let showExitModal = false;
    let isCreatingRepository = false;
    let hasInstallations = !!data?.installations?.total;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = data.template.name;
    let id = ID.unique();
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
    let execute = false;
    let variables: Partial<Models.Variable>[] = [];

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
            runtime = matchingRuntimes[0];
        }
        console.log(runtime);
    });

    async function createRepository() {
        try {
            isCreatingRepository = true;
            const repo = await sdk.forProject.vcs.createRepository(
                $installation.$id,
                repositoryName,
                repositoryPrivate
            );
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
                const func = await sdk.forProject.functions.create(
                    id,
                    name,
                    runtime as Runtime,
                    undefined, //excute ? permissions  || undefined : undefined,
                    undefined,
                    undefined,
                    undefined,
                    true,
                    undefined,
                    entrypoint,
                    undefined,
                    selectedScopes?.length ? selectedScopes : undefined,
                    $installation.$id,
                    $repository.id,
                    branch,
                    silentMode,
                    rootDir,
                    undefined //TODO: specs
                );

                // Add domain
                await sdk.forProject.proxy.createFunctionRule(
                    `${ID.unique()}.${$consoleVariables._APP_DOMAIN_TARGET}`,
                    func.$id
                );

                // Add variables
                const promises = variables.map((variable) =>
                    sdk.forProject.functions.createVariable(
                        func.$id,
                        variable.key,
                        variable.value,
                        variable?.secret ?? false
                    )
                );
                await Promise.all(promises);

                await sdk.forProject.functions.createVcsDeployment(
                    func.$id,
                    Type.Branch,
                    branch,
                    true
                );

                trackEvent(Submit.FunctionCreate, {
                    runtime: runtime,
                    source: 'template',
                    framework: data.template.name
                });

                await goto(
                    `${base}/project-${$page.params.project}/functions/function-${func.$id}`
                );
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                trackError(e, Submit.FunctionCreate);
            }
        }
    }

    async function loadBranches() {
        const { branches } = await sdk.forProject.vcs.listRepositoryBranches(
            selectedInstallationId,
            selectedRepository
        );
        const sorted = sortBranches(branches);
        branch = sorted[0]?.name ?? null;

        if (!branch) {
            branch = 'main';
        }

        return sorted;
    }

    $: if (repositoryBehaviour === 'new') {
        selectedInstallationId ??= $installation?.$id;
        repositoryName ??= name.split(' ').join('-').toLowerCase();
    }

    $: if (connectBehaviour === 'later') {
        selectedRepository = null;
    }

    $: console.log(data.template);
    $: console.log(variables);
</script>

<svelte:head>
    <title>Create function - Appwrite</title>
</svelte:head>

<Wizard
    title="Create function"
    bind:showExitModal
    href={`${base}/project-${$page.params.project}/functions`}
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xl">
            {#if selectedRepository && showConfig}
                <Layout.Stack gap="xxl">
                    <Card isTile padding="s" radius="s">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            gap="xs">
                            <Layout.Stack direction="row" alignItems="center" gap="s">
                                <Icon size="s" icon={IconGithub} />
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                    {$repository.organization}/{$repository.name}
                                </Typography.Text>
                            </Layout.Stack>
                            <Button
                                size="s"
                                secondary
                                on:click={() => {
                                    showConfig = false;
                                }}>
                                Update
                            </Button>
                        </Layout.Stack>
                    </Card>
                    {#await loadBranches()}
                        <Layout.Stack justifyContent="center" alignItems="center">
                            <div class="loader u-margin-32" />
                        </Layout.Stack>
                    {:then branches}
                        {@const options =
                            branches
                                ?.map((branch) => {
                                    return {
                                        value: branch.name,
                                        label: branch.name
                                    };
                                })
                                ?.sort((a, b) => {
                                    return a.label > b.label ? 1 : -1;
                                }) ?? []}
                        <ProductionBranch bind:branch bind:rootDir {options} bind:silentMode />
                    {/await}

                    {#if data.template.variables?.length}
                        <Configuration bind:variables templateVariables={data.template.variables} />
                    {/if}
                </Layout.Stack>
            {:else}
                {@const options = data.template.runtimes.map((runtime) => {
                    return {
                        value: runtime.name,
                        label: runtime.name,
                        leadingHtml: `<img src='${$iconPath(getIconFromRuntime(runtime.name), 'color')}' style='inline-size: var(--icon-size-m)' />`
                    };
                })}

                <Layout.Stack gap="xxl">
                    <Details bind:name bind:id bind:runtime bind:entrypoint {options} />

                    <Permissions
                        templateScopes={data.template.scopes}
                        bind:selectedScopes
                        bind:execute />

                    <ConnectBehaviour bind:connectBehaviour />
                </Layout.Stack>
                {#if connectBehaviour === 'now'}
                    {#if hasInstallations}
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
                                        bind:hasInstallations
                                        bind:selectedRepository
                                        product="sites"
                                        action="button"
                                        on:connect={(e) => {
                                            trackEvent(Click.ConnectRepositoryClick, {
                                                from: 'template-wizard'
                                            });
                                            repository.set(e.detail);
                                            repositoryName = e.detail.name;
                                            selectedRepository = e.detail.id;
                                            showConfig = true;
                                        }} />
                                {/if}
                            </Layout.Stack>
                        </Fieldset>
                    {:else}
                        <Card isDashed isTile padding="none">
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
        <Aside {runtime} {repositoryName} {branch} {rootDir} runtimes={data.runtimesList} />
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile size="s" secondary on:click={() => (showExitModal = true)}>
            Cancel
        </Button>
        <Button
            fullWidthMobile
            size="s"
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting || (connectBehaviour === 'now' && !selectedRepository)}>
            Deploy
        </Button>
    </svelte:fragment>
</Wizard>
