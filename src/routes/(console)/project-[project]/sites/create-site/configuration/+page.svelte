<script lang="ts">
    import { afterNavigate, goto, invalidate, preloadData } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Card } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import {
        Button,
        Form,
        InputChoice,
        InputRadio,
        InputSelect,
        InputSelectSearch,
        InputText
    } from '$lib/elements/forms';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository, sortBranches } from '$lib/stores/vcs';
    // import { consoleVariables } from '$routes/(console)/store';
    import { Fieldset, Layout, Empty, Icon, Divider } from '@appwrite.io/pink-svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Repositories from '$lib/components/repositories.svelte';
    import Details from './details.svelte';
    import ConnectBehaviour from './connectBehaviour.svelte';
    import ProductionBranch from './productionBranch.svelte';
    import Configuration from './configuration.svelte';
    import Aside from './aside.svelte';

    export let data;

    let previousPage: string = base;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });
    let showExitModal = false;
    let isTemplate = !!data?.template;
    let hasInstallations = !!data?.installations?.total;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = data?.template?.name ?? '';
    let id = data?.template?.$id ?? '';
    let framework = data?.template?.frameworks[0] ?? '';
    let branch: string;
    let rootDir = '';
    let connectBehaviour: 'now' | 'later' = 'now';
    let repositoryBehaviour: 'new' | 'existing' = 'new';
    let repositoryName = '';
    let repositoryPrivate = false;
    let selectedInstallationId = '';
    let selectedRepository = '';
    let showSiteConfig = false;
    let variables = [];

    onMount(() => {
        if (isTemplate) {
            $installation ??= data.installations[0];
            selectedInstallationId = $installation?.$id;
        }
    });

    async function loadBranches() {
        const { branches } = await sdk.forProject.vcs.listRepositoryBranches(
            data.installations.installations[0].$id,
            $repository.id
        );
        selectedInstallationId = $installation.$id;
        const sorted = sortBranches(branches);
        branch = sorted[0]?.name ?? null;

        if (!branch) {
            branch = 'main';
        }

        return sorted;
    }

    async function create() {
        try {
            let site;

            trackEvent(Submit.OrganizationCreate, {});

            await invalidate(Dependencies.ACCOUNT);
            await preloadData(`${base}/project-${$page.params.project}/sites/site-${site.$id}`);
            await goto(`${base}/project-${$page.params.project}/sites/site-${site.$id}`);
            addNotification({
                type: 'success',
                message: `${name ?? 'Organization'} has been created`
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.OrganizationCreate);
        }
    }

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
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer bind:showExitModal href={previousPage} confirmExit>
    <svelte:fragment slot="title">Create site</svelte:fragment>
    <WizardSecondaryContent>
        <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
            {#if isTemplate}
                <Layout.Stack gap="xl">
                    {#if selectedRepository && showSiteConfig}
                        <Card>
                            <Layout.Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                gap="xs">
                                <Layout.Stack direction="row" alignItems="center">
                                    <Icon icon={IconGithub} />
                                    <p>
                                        {$repository.name}
                                    </p>
                                </Layout.Stack>
                                <Button
                                    secondary
                                    on:click={() => {
                                        showSiteConfig = false;
                                    }}>
                                    Change
                                </Button>
                            </Layout.Stack>
                        </Card>
                        <ProductionBranch bind:branch bind:rootDir />
                        <Configuration
                            {framework}
                            source="template"
                            bind:variables
                            templateVariables={data.template.variables} />
                    {:else}
                        {@const options = data.template.frameworks.map((framework) => {
                            return {
                                value: framework,
                                label: framework
                            };
                        })}

                        <Details bind:name bind:id bind:framework {options} showFramework />
                        <ConnectBehaviour bind:connectBehaviour />
                        {#if connectBehaviour === 'now'}
                            {#if hasInstallations}
                                <Fieldset legend="Git repositoy">
                                    <Layout.Stack gap="l">
                                        <Layout.Stack direction="row" gap="xl">
                                            <InputRadio
                                                size="small"
                                                label="Create a new repository"
                                                bind:group={repositoryBehaviour}
                                                value="new"
                                                id="new"
                                                name="new" />
                                            <InputRadio
                                                size="small"
                                                label="Connect to an existing repository"
                                                bind:group={repositoryBehaviour}
                                                value="existing"
                                                id="existing"
                                                name="existing" />
                                        </Layout.Stack>
                                        {#if repositoryBehaviour === 'new'}
                                            <InputSelect
                                                id="installation"
                                                label="Git organization"
                                                options={data.installations.installations.map(
                                                    (entry) => {
                                                        return {
                                                            label: entry.organization,
                                                            value: entry.$id
                                                        };
                                                    }
                                                )}
                                                on:change={() => {
                                                    $installation =
                                                        data.installations.installations.find(
                                                            (entry) =>
                                                                entry.$id === selectedInstallationId
                                                        );
                                                }}
                                                bind:value={selectedInstallationId} />
                                            <InputText
                                                id="repositoryName"
                                                label="Repository name"
                                                placeholder="my-repository"
                                                bind:value={repositoryName} />
                                            <InputChoice
                                                id="repositoryPrivate"
                                                label="Keep repository private"
                                                bind:value={repositoryPrivate} />

                                            <Layout.Stack gap="xl" alignItems="flex-end">
                                                <Divider />

                                                <Button>Create</Button>
                                            </Layout.Stack>
                                        {:else}
                                            <Repositories
                                                bind:hasInstallations
                                                bind:selectedRepository
                                                action="button"
                                                callbackState={{
                                                    from: 'github',
                                                    to: 'cover'
                                                }}
                                                on:connect={(e) => {
                                                    trackEvent('click_connect_repository', {
                                                        from: 'cover'
                                                    });
                                                    repository.set(e.detail);
                                                    repositoryName = e.detail.name;
                                                    selectedRepository = e.detail.id;
                                                    showSiteConfig = true;
                                                }} />
                                        {/if}
                                    </Layout.Stack>
                                </Fieldset>
                            {/if}
                        {:else}
                            <Card isDashed isTile>
                                <Empty
                                    title={`Connect Git repository`}
                                    description="Create and deploy a Site with a connected git repository.">
                                    <svelte:fragment slot="actions">
                                        <Button
                                            secondary
                                            href={connectGitHub().toString()}
                                            size="small">
                                            <Icon icon={IconGithub} />
                                            Connect to GitHub
                                        </Button>
                                    </svelte:fragment>
                                </Empty>
                            </Card>
                        {/if}
                    {/if}
                </Layout.Stack>
                <!-- If not template -->
            {:else}
                <Layout.Stack gap="xl">
                    <Details bind:name bind:id />

                    <Fieldset legend="Details">
                        {#await loadBranches()}
                            <div class="u-flex u-gap-8 u-cross-center u-main-center">
                                <div class="loader u-margin-32" />
                            </div>
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
                            <Layout.Stack>
                                <InputSelectSearch
                                    required={true}
                                    id="branch"
                                    label="Production branch"
                                    placeholder="Select branch"
                                    tooltip="Every commit pushed to this branch will activate the deployment after a successful build"
                                    hideRequired
                                    bind:value={branch}
                                    bind:search={branch}
                                    on:select={(event) => {
                                        branch = event.detail.value;
                                    }}
                                    interactiveOutput
                                    name="branch"
                                    {options} />
                                <InputText
                                    id="root"
                                    label="Root directory"
                                    placeholder="Select directory"
                                    bind:value={rootDir} />
                            </Layout.Stack>
                        {/await}
                    </Fieldset>
                </Layout.Stack>
            {/if}
        </Form>
        <svelte:fragment slot="aside">
            <Aside
                {isTemplate}
                template={data.template}
                {name}
                {framework}
                {repositoryName}
                {branch}
                {rootDir} />
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Create site
        </Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>
