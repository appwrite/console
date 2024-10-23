<script lang="ts">
    import { afterNavigate, goto, invalidate, preloadData } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Card, LabelCard } from '$lib/components';
    import CustomId from '$lib/components/customId.svelte';
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
    import Pill from '$lib/elements/pill.svelte';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { installation, installations, repository, sortBranches } from '$lib/stores/vcs';
    // import { consoleVariables } from '$routes/(console)/store';
    import {
        Fieldset,
        Layout,
        Empty,
        Icon,
        Typography,
        Image,
        Divider
    } from '@appwrite.io/pink-svelte';
    import { IconGitBranch } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Repositories from '$lib/components/repositories.svelte';

    export let data;
    // const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
    const isVcsEnabled = true;

    let previousPage: string = base;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });
    let showExitModal = false;
    let isTemplate = !!data?.template;
    let hasInstallations = !!data?.installations?.total;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name: string;
    let id: string;
    let showCustomId = false;
    let branch: string;
    let rootDir = '';
    let framework: string;
    let connectBehaviour: 'now' | 'later' = 'now';
    let repositoryBehaviour = 'new';
    let repositoryName = '';
    let repositoryPrivate = false;
    let selectedInstallationId = '';
    let selectedRepository = '';

    onMount(() => {
        if (isTemplate) {
            name = data.template.name;
            framework = data.template.frameworks[0];
            $installation = data.installations[0];
            selectedInstallationId = $installation.$id;
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

    async function createRepo() {
        selectedRepository = '1234';
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
                {@const options = data.template.frameworks.map((framework) => {
                    return {
                        value: framework,
                        label: framework
                    };
                })}
                <Layout.Stack gap="xl">
                    <Fieldset legend="Details">
                        <Layout.Stack gap="l">
                            <InputText
                                label="Name"
                                id="name"
                                name="name"
                                bind:value={name}
                                required
                                placeholder="Enter name" />
                            {#if showCustomId}
                                <CustomId bind:id bind:show={showCustomId} name="Site" fullWidth />
                            {:else}
                                <div>
                                    <Pill button on:click={() => (showCustomId = !showCustomId)}>
                                        <span class="icon-pencil" aria-hidden="true" />
                                        <span class="text">Site ID </span>
                                    </Pill>
                                </div>
                            {/if}

                            <InputSelect
                                id="framework"
                                label="Framework"
                                placeholder="Select framework"
                                bind:value={framework}
                                {options} />
                        </Layout.Stack>
                    </Fieldset>
                    <div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
                        <LabelCard
                            name="connect-behaviour"
                            value="now"
                            bind:group={connectBehaviour}
                            disabled={!isVcsEnabled}>
                            <svelte:fragment slot="title">
                                Connect to Git repository
                            </svelte:fragment>
                            Clone the template to a new repository or connect it to an existing one.
                        </LabelCard>
                        <LabelCard
                            name="connect-behaviour"
                            value="later"
                            bind:group={connectBehaviour}
                            disabled={!isVcsEnabled}>
                            <svelte:fragment slot="title">Connect later</svelte:fragment>
                            Deploy now and continue development via CLI, or connect Git from your site
                            settings.
                        </LabelCard>
                    </div>
                    {#if connectBehaviour === 'now'}
                        {#if hasInstallations}
                            <Fieldset legend="Git repositoy">
                                <Layout.Stack gap="l">
                                    <Layout.Stack direction="row" gap="xl">
                                        <InputRadio
                                            label="Create a new repository"
                                            bind:group={repositoryBehaviour}
                                            value="new"
                                            id="new"
                                            name="new" />
                                        <InputRadio
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
                                        <Button
                                            secondary
                                            href={connectGitHub().toString()}
                                            size="small">
                                            <Icon icon={IconGitBranch} />
                                            <!-- TODO: replace icon -->
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
                    <Fieldset legend="Details">
                        <Layout.Stack>
                            <InputText
                                label="Name"
                                id="name"
                                name="name"
                                bind:value={name}
                                required
                                placeholder="Enter name" />
                            {#if showCustomId}
                                <CustomId bind:id bind:show={showCustomId} name="Site" fullWidth />
                            {:else}
                                <div>
                                    <Pill button on:click={() => (showCustomId = !showCustomId)}>
                                        <span class="icon-pencil" aria-hidden="true" />
                                        <span class="text">Site ID </span>
                                    </Pill>
                                </div>
                            {/if}
                        </Layout.Stack>
                    </Fieldset>

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
            {#if isTemplate}
                <Card padding="x-small">
                    <Layout.Stack gap="m">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <Typography.Text variant="m-500">
                                {data.template.name}
                            </Typography.Text>

                            <Button secondary size="small">View demo</Button>
                        </Layout.Stack>

                        <Image
                            src={data.template.preview}
                            alt={data.template.name}
                            width={357}
                            height={200} />

                        <Typography.Caption variant="400">Framework</Typography.Caption>
                    </Layout.Stack>
                </Card>
            {/if}
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
