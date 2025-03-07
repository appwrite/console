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
    import { installation, repository } from '$lib/stores/vcs';
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

    export let data;

    let showExitModal = false;
    let isCreatingRepository = false;
    let hasInstallations = !!data?.installations?.total;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = data.template.name;
    let id = ID.unique();
    let runtime: Models.Runtime = data.runtimesList.runtimes[0];
    let branch = 'main';
    let rootDir = './';
    let connectBehaviour: 'now' | 'later' = 'now';
    let repositoryBehaviour: 'new' | 'existing' = 'new';
    let repositoryName = undefined;
    let repositoryPrivate = true;
    let selectedInstallationId = '';
    let selectedRepository = '';
    let showSiteConfig = false;
    let silentMode = false;
    let entrypoint = '';
    let scopes: string[] = [];
    let variables: Partial<Models.Variable>[] = [];

    onMount(async () => {
        if (!$installation?.$id) {
            $installation = data.installations.installations[0];
        }
        selectedInstallationId = $installation?.$id;
    });

    let callbackState: Record<string, string> = null;

    function connectGitHub() {
        const redirect = new URL($page.url);
        if (callbackState) {
            Object.keys(callbackState).forEach((key) => {
                redirect.searchParams.append(key, callbackState[key]);
            });
        }
        const target = new URL(`${sdk.forProject.client.config.endpoint}/vcs/github/authorize`);
        target.searchParams.set('project', $page.params.project);
        target.searchParams.set('success', redirect.toString());
        target.searchParams.set('failure', redirect.toString());
        target.searchParams.set('mode', 'admin');
        return target;
    }

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
            showSiteConfig = true;
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
                const rt = Object.values(Runtime).find((r) => r === runtime.key);
                const func = await sdk.forProject.functions.create(
                    id,
                    name,
                    rt,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    true,
                    undefined,
                    entrypoint,
                    undefined,
                    scopes,
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

                //Add variables
                const promises = variables.map((variable) =>
                    sdk.forProject.functions.createVariable(
                        func.$id,
                        variable.key,
                        variable.value,
                        variable?.secret ?? false
                    )
                );
                await Promise.all(promises);

                const deployment = await sdk.forProject.functions.createVcsDeployment(
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
                    `${base}/project-${$page.params.project}/functions/create-function/deploying?function=${func.$id}&deployment=${deployment.$id}`
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

    $: if (repositoryBehaviour === 'new') {
        selectedInstallationId = $installation?.$id;
        repositoryName ??= name.split(' ').join('-').toLowerCase();
    }

    $: if (connectBehaviour === 'later') {
        selectedRepository = null;
    }

    $: console.log(repositoryName);

    $: console.log(data.template);
    $: console.log(variables);
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<Wizard
    title="Create site"
    bind:showExitModal
    href={`${base}/project-${$page.params.project}/sites/`}
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xl">
            {#if selectedRepository && showSiteConfig}
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
                                    {$repository.name}
                                </Typography.Text>
                            </Layout.Stack>
                            <Button
                                size="s"
                                secondary
                                on:click={() => {
                                    showSiteConfig = false;
                                }}>
                                Update
                            </Button>
                        </Layout.Stack>
                    </Card>
                    <ProductionBranch bind:branch bind:rootDir bind:silentMode />
                    {#if data.template.variables?.length}
                        <Configuration bind:variables templateVariables={data.template.variables} />
                    {/if}
                    <!-- <Domain bind:domain bind:domainIsValid /> -->
                </Layout.Stack>
            {:else}
                {@const options = data.template.runtimes.map((runtime) => {
                    return {
                        value: runtime.name,
                        label: runtime.name
                        // leadingHtml: `<img src='${$iconPath(getruntimeIcon(runtime.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
                    };
                })}
                <Layout.Stack gap="xxl">
                    <Details bind:name bind:id bind:runtime bind:entrypoint {options} />
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
                                            showSiteConfig = true;
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
        <Aside {runtime} {repositoryName} {branch} {rootDir} />
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
