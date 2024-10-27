<script lang="ts">
    import { goto, invalidate, preloadData } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Card } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { sortBranches } from '$lib/stores/vcs';
    import { Layout, Icon } from '@appwrite.io/pink-svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { writable } from 'svelte/store';
    import Details from '../../details.svelte';
    import ProductionBranch from '../../productionBranch.svelte';
    import Configuration from './configuration.svelte';
    import Aside from '../../aside.svelte';
    import { ID } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { getEnumFromModel } from '../../../store';

    export let data;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = '';
    let id = '';
    let framework: Models.Framework;
    let branch: string;
    let rootDir = '';
    let selectedInstallationId = '';
    let selectedRepository = '';
    let installCommand = '';
    let buildCommand = '';
    let outputDirectory = '';
    let variables: Partial<Models.Variable>[] = [
        {
            key: 'APPWRITE_ENDPOINT',
            value: 'fsssf',
            secret: false
        },
        {
            key: 'APPWRITE_ENDPOINT2',
            value: '',
            secret: true
        }
    ];

    async function loadBranches() {
        const { branches } = await sdk.forProject.vcs.listRepositoryBranches(
            data.installation.$id,
            data.repository.id
        );
        selectedInstallationId = data.installation.$id;
        const sorted = sortBranches(branches);
        branch = sorted[0]?.name ?? null;

        if (!branch) {
            branch = 'main';
        }

        return sorted;
    }

    async function create() {
        try {
            let site = await sdk.forProject.sites.create(
                id || ID.unique(),
                name,
                getEnumFromModel(
                    data.frameworks.frameworks.find((fr) => fr.name === framework.name)
                ),
                true,
                30,
                installCommand,
                buildCommand,
                outputDirectory,
                undefined,
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
                                {data.repository?.name}
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
                    <ProductionBranch bind:branch bind:rootDir {options} />
                {/await}

                <Configuration
                    bind:installCommand
                    bind:buildCommand
                    bind:outputDirectory
                    bind:selectedFramework={framework}
                    bind:variables
                    frameworks={data.frameworks.frameworks} />
            </Layout.Stack>
        </Form>
        <svelte:fragment slot="aside">
            <Aside {framework} repositoryName={data.repository.name} {branch} {rootDir} />
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
