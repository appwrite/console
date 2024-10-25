<script lang="ts">
    import { goto, invalidate, preloadData } from '$app/navigation';
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
    import { Fieldset, Layout, Icon, Divider, Empty } from '@appwrite.io/pink-svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Repositories from '$lib/components/repositories.svelte';
    import Details from '../../details.svelte';
    import ConnectBehaviour from '../../connectBehaviour.svelte';
    import ProductionBranch from '../../productionBranch.svelte';
    import Configuration from '../../configuration.svelte';
    import Aside from '../../aside.svelte';
    import { ID } from '@appwrite.io/console';

    export let data;

    let showExitModal = false;
    let hasInstallations = !!data?.installations?.total;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = data?.template?.name ?? '';
    let id = '';
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
    let installCommand = '';
    let buildCommand = '';
    let outputDirectory = '';

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

    async function create() {
        try {
            let site = await sdk.forProject.sites.create(
                id || ID.unique(),
                name,
                framework,
                true,
                installCommand,
                buildCommand,
                outputDirectory,
                undefined,
                undefined,
                selectedInstallationId,
                selectedRepository,
                branch,
                undefined,
                rootDir
            );

            trackEvent(Submit.SiteCreate, {});

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
            trackError(e, Submit.SiteCreate);
        }
    }
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer
    bind:showExitModal
    href={`${base}/project-${$page.params.project}/sites/`}
    confirmExit>
    <svelte:fragment slot="title">Create site</svelte:fragment>
    <WizardSecondaryContent>
        <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
            <Layout.Stack gap="xl">
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
                            href={`${base}/project-${$page.params.project}/sites/create-site/repositories`}>
                            Change
                        </Button>
                    </Layout.Stack>
                </Card>
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
            Deploy
        </Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>
