<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
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
    import { IconExternalLink, IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Details from '../../details.svelte';
    import Configuration from './configuration.svelte';
    import Aside from '../../aside.svelte';
    import { Adapter, BuildRuntime, Framework, ID, type Models } from '@appwrite.io/console';
    import {
        ConnectBehaviour,
        NewRepository,
        ProductionBranchFieldset,
        Repositories,
        RepositoryBehaviour
    } from '$lib/components/git';
    import Domain from '../../domain.svelte';
    import { app, iconPath } from '$lib/stores/app';
    import { connectGitHub } from '$lib/stores/git';
    import { getFrameworkIcon } from '$lib/stores/sites';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { getTemplateSourceUrl } from '$lib/helpers/templateSource';

    export let data;

    let showExitModal = false;
    let isCreatingRepository = false;
    let hasInstallations = !!data?.installations?.total;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = data.template.name;
    let id = ID.unique();
    let domain = data.domain;
    let domainIsValid = true;
    let framework = data?.template?.frameworks[0];
    let branch = 'main';
    let rootDir = './';
    let connectBehaviour: 'now' | 'later' = 'now';
    let repositoryBehaviour: 'new' | 'existing' = 'new';
    let repositoryName: string = undefined;
    let repositoryPrivate = true;
    let selectedInstallationId = '';
    let selectedRepository = '';
    let showSiteConfig = false;
    let variables: Partial<Models.TemplateVariable>[] = [];
    let silentMode = false;

    onMount(async () => {
        if (!$installation?.$id) {
            $installation = data.installations.installations[0];
        }
        selectedInstallationId = $installation?.$id;
    });

    async function createRepository() {
        try {
            isCreatingRepository = true;
            const repo = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.createRepository({
                    installationId: $installation.$id,
                    name: repositoryName,
                    xprivate: repositoryPrivate
                });
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
        } else if (!domainIsValid) {
            addNotification({
                type: 'error',
                message: 'Domain is not valid'
            });
            return;
        } else {
            try {
                const fr = Object.values(Framework).find((f) => f === framework.key);
                const buildRuntime = Object.values(BuildRuntime).find(
                    (f) => f === framework.buildRuntime
                );
                let site = await sdk
                    .forProject(page.params.region, page.params.project)
                    .sites.create({
                        siteId: id || ID.unique(),
                        name,
                        framework: fr,
                        buildRuntime,
                        installCommand: framework.installCommand,
                        buildCommand: framework.buildCommand,
                        outputDirectory: framework.outputDirectory,
                        adapter: framework.adapter as unknown as Adapter,
                        installationId:
                            connectBehaviour === 'later' ? undefined : selectedInstallationId,
                        fallbackFile: framework?.fallbackFile,
                        providerRepositoryId: selectedRepository,
                        providerBranch: branch,
                        providerSilentMode: selectedRepository ? silentMode : undefined,
                        providerRootDirectory: rootDir
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
                        key: variable.name,
                        value: variable.value,
                        secret: variable?.secret ?? false
                    })
                );

                await Promise.all(promises);

                const deployment = await sdk
                    .forProject(page.params.region, page.params.project)
                    .sites.createTemplateDeployment({
                        siteId: site.$id,
                        repository: data.template.providerRepositoryId,
                        owner: data.template.providerOwner,
                        rootDirectory: framework.providerRootDirectory,
                        version: data.template.providerVersion,
                        activate: true
                    });

                trackEvent(Submit.SiteCreate, {
                    source: 'template',
                    framework: framework.key,
                    template: data.template.name
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
    }

    $: if (repositoryBehaviour === 'new') {
        selectedInstallationId = $installation?.$id;
        repositoryName ??= name.split(' ').join('-').toLowerCase();
    }

    $: if (connectBehaviour === 'later') {
        selectedRepository = null;
    }
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<Wizard
    title="Create site"
    bind:showExitModal
    href={`${base}/project-${page.params.region}-${page.params.project}/sites/`}
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xl">
            {#if selectedRepository && showSiteConfig}
                <Layout.Stack gap="xxl">
                    <Card padding="s" radius="s">
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
                                    showSiteConfig = false;
                                }}>
                                Update
                            </Button>
                        </Layout.Stack>
                    </Card>
                    <ProductionBranchFieldset
                        bind:branch
                        bind:rootDir
                        bind:silentMode
                        product="sites"
                        installationId={selectedInstallationId}
                        repositoryId={selectedRepository} />
                    {#if data.template.variables?.length}
                        <Configuration bind:variables templateVariables={data.template.variables} />
                    {/if}
                </Layout.Stack>
            {:else}
                {@const options = data.template.frameworks.map((framework) => {
                    return {
                        value: framework.name,
                        label: framework.name,
                        leadingHtml: `<img src='${$iconPath(getFrameworkIcon(framework.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
                    };
                })}
                <Layout.Stack gap="xxl">
                    <Details
                        bind:name
                        bind:id
                        bind:framework
                        {options}
                        showFramework={options?.length > 1} />
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
                                        connect={(e) => {
                                            trackEvent(Click.ConnectRepositoryClick, {
                                                from: 'template-wizard'
                                            });
                                            repository.set(e);
                                            repositoryName = e.name;
                                            selectedRepository = e.id;
                                            showSiteConfig = true;
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
            {#if connectBehaviour === 'later' || selectedRepository}
                <Domain bind:domain bind:domainIsValid />
            {/if}
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside {framework} {repositoryName} {branch} {rootDir} showAfter={showSiteConfig}>
            <Layout.Stack>
                <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography.Text variant="m-500" truncate color="--fgcolor-neutral-primary">
                        {name || data.template.name}
                    </Typography.Text>
                    {#if data?.template?.demoUrl}
                        <Button secondary size="s" external href={data.template.demoUrl}>
                            View demo
                            <Icon icon={IconExternalLink} slot="end" size="s" />
                        </Button>
                    {/if}
                </Layout.Stack>

                <Image
                    objectPosition="top"
                    border
                    src={$app.themeInUse === 'dark'
                        ? data?.template?.screenshotDark ||
                          `${base}/images/sites/screenshot-placeholder-dark.svg`
                        : data?.template?.screenshotLight ||
                          `${base}/images/sites/screenshot-placeholder-light.svg`}
                    alt={data.template.name}
                    ratio="16/9" />
            </Layout.Stack>

            <svelte:fragment slot="framework-actions">
                {@const sourceUrl = getTemplateSourceUrl(data.template)}
                {#if sourceUrl}
                    <Button secondary size="s" external href={sourceUrl}>
                        View source
                        <Icon icon={IconExternalLink} slot="end" size="s" />
                    </Button>
                {/if}
            </svelte:fragment>
        </Aside>
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
