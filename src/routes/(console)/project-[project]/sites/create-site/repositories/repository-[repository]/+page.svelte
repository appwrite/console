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
    import { sortBranches } from '$lib/stores/vcs';
    import { Layout, Icon } from '@appwrite.io/pink-svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { writable } from 'svelte/store';
    import Details from '../../details.svelte';
    import ProductionBranch from '../../productionBranch.svelte';
    import Configuration from './configuration.svelte';
    import Aside from '../../aside.svelte';
    import { BuildRuntime, Framework, ID, Query, ServeRuntime } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';

    export let data;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = '';
    let id = '';
    let framework: Models.Framework;
    let branch: string;
    let rootDir = '';
    let installCommand = 'npm ci';
    let buildCommand = 'npm run build';
    let outputDirectory = 'dist';
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
    let silentMode = false;

    async function loadBranches() {
        const { branches } = await sdk.forProject.vcs.listRepositoryBranches(
            data.installation.$id,
            data.repository.id
        );
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
                Framework.Sveltekit,
                BuildRuntime.Node22,
                ServeRuntime.Static1,
                undefined,
                undefined,
                installCommand,
                buildCommand,
                outputDirectory,
                undefined,
                data.installation.providerInstallationId,
                null,
                data.repository.id,
                branch,
                silentMode,
                rootDir
            );

            trackEvent(Submit.SiteCreate, {});

            const { deployments } = await sdk.forProject.sites.listDeployments(site.$id, [
                Query.limit(1)
            ]);
            console.log(deployments);
            const deployment = deployments[0];
            await goto(
                `${base}/project-${$page.params.project}/sites/create-site/deploying?site=${site.$id}&deployment=${deployment.$id}`
            );
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

<Wizard
    title="Create site"
    bind:showExitModal
    href={`${base}/project-${$page.params.project}/sites/`}
    confirmExit>
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
                <ProductionBranch bind:branch bind:rootDir {options} bind:silentMode />
            {/await}

            <Configuration
                bind:installCommand
                bind:buildCommand
                bind:outputDirectory
                bind:selectedFramework={framework}
                bind:variables
                frameworks={data.frameworks.frameworks} />

            <!-- <Domain /> -->
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside
            frameworkName={framework.name}
            repositoryName={data.repository.name}
            {branch}
            {rootDir} />
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button size="s" fullWidthMobile secondary on:click={() => (showExitModal = true)}
            >Cancel</Button>
        <Button
            size="s"
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Deploy
        </Button>
    </svelte:fragment>
</Wizard>
