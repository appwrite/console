<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Card } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import {
        Fieldset,
        Layout,
        Icon,
        Divider,
        Empty,
        Typography,
        Image
    } from '@appwrite.io/pink-svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Details from '../../details.svelte';
    import ConnectBehaviour from './connectBehaviour.svelte';
    import ProductionBranch from '../../productionBranch.svelte';
    import Configuration from './configuration.svelte';
    import Aside from '../../aside.svelte';
    import { BuildRuntime, Framework, ID, Query, ServeRuntime } from '@appwrite.io/console';
    import Domain from '../../domain.svelte';
    import { NewRepository, Repositories, RepositoryBehaviour } from '$lib/components/git';

    export let data;

    let showExitModal = false;
    let hasInstallations = !!data?.installations?.total;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = data.template.name;
    let id = ID.unique();
    let domain = id;
    let framework = data?.template?.frameworks[0];
    let branch = 'main';
    let rootDir = './';
    let connectBehaviour: 'now' | 'later' = 'now';
    let repositoryBehaviour: 'new' | 'existing' = 'new';
    let repositoryName = '';
    let repositoryPrivate = true;
    let selectedInstallationId = '';
    let selectedRepository = '';
    let showSiteConfig = false;
    let variables = [];
    let silentMode = false;

    onMount(() => {
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
        }
    }

    async function create() {
        try {
            let site = await sdk.forProject.sites.create(
                id || ID.unique(),
                name,
                Framework.Sveltekit,
                BuildRuntime.Node22,
                ServeRuntime.Static1,
                undefined,
                undefined,
                framework.installCommand,
                framework.buildCommand,
                framework.outputDirectory,
                domain,
                selectedInstallationId || undefined,
                framework.fallbackFile,
                selectedRepository || undefined,
                branch || undefined,
                selectedRepository ? silentMode : undefined,
                rootDir || undefined,
                data.template.providerRepositoryId,
                data.template.providerOwner,
                framework.providerRootDirectory,
                data.template.providerVersion
            );

            trackEvent(Submit.SiteCreate, {});

            const { deployments } = await sdk.forProject.sites.listDeployments(site.$id, [
                Query.limit(1)
            ]);
            const deployment = deployments[0];
            await goto(
                `${base}/project-${$page.params.project}/sites/create-site/deploying?site=${site.$id}&deployment=${deployment.$id}`
            );
        } catch (e) {
            console.log(e);
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.SiteCreate);
        }
    }

    $: if (repositoryBehaviour === 'new') {
        selectedInstallationId = $installation?.$id;
        repositoryName = name.split(' ').join('-').toLowerCase();
    }
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
                                <Typography.Text
                                    variant="m-400"
                                    color="--color-fgcolor-neutral-primary">
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
                    <Domain bind:domain />
                </Layout.Stack>
            {:else}
                {@const options = data.template.frameworks.map((framework) => {
                    return {
                        value: framework.name,
                        label: framework.name
                    };
                })}
                <Layout.Stack gap="xxl">
                    <Details bind:name bind:id bind:framework {options} showFramework />
                    <ConnectBehaviour bind:connectBehaviour />
                </Layout.Stack>
                {#if connectBehaviour === 'now'}
                    {#if hasInstallations}
                        <Fieldset legend="Git repositoy">
                            <Layout.Stack gap="xl">
                                <RepositoryBehaviour bind:repositoryBehaviour />
                                {#if repositoryBehaviour === 'new'}
                                    <NewRepository
                                        bind:selectedInstallationId
                                        installations={data.installations}
                                        bind:repositoryName
                                        bind:repositoryPrivate />
                                    <Layout.Stack gap="xl" alignItems="flex-end">
                                        <Divider />

                                        <Button
                                            size="s"
                                            on:click={createRepository}
                                            disabled={!repositoryName || !$installation?.$id}>
                                            Create
                                        </Button>
                                    </Layout.Stack>
                                {:else}
                                    <Repositories
                                        bind:hasInstallations
                                        bind:selectedRepository
                                        action="button"
                                        on:connect={(e) => {
                                            trackEvent('click_connect_repository', {
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
                        <Card isDashed isTile>
                            <Empty
                                title={`Connect Git repository`}
                                description="Create and deploy a Site with a connected git repository.">
                                <svelte:fragment slot="actions">
                                    <Button secondary href={connectGitHub().toString()} size="s">
                                        <Icon icon={IconGithub} />
                                        Connect to GitHub
                                    </Button>
                                </svelte:fragment>
                            </Empty>
                        </Card>
                    {/if}
                {:else}
                    {#if data.template.variables?.length}
                        <Configuration bind:variables templateVariables={data.template.variables} />
                    {/if}
                    <Domain bind:domain />
                {/if}
            {/if}
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside {framework} {repositoryName} {branch} {rootDir} {domain} showAfter={showSiteConfig}>
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography.Text variant="m-500" truncate>
                    {name || data.template.name}
                </Typography.Text>
                <!-- TODO: re-enable -->
                <Button secondary size="s" href={data.template.demoUrl} disabled>View demo</Button>
            </Layout.Stack>

            <Image
                objectPosition="top"
                src={data.template.demoImage}
                alt={data.template.name}
                width={357}
                height={200} />
        </Aside>
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile size="s" secondary on:click={() => (showExitModal = true)}
            >Cancel</Button>
        <Button
            fullWidthMobile
            size="s"
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Deploy
        </Button>
    </svelte:fragment>
</Wizard>
