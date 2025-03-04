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
    import { installation, repository, sortBranches } from '$lib/stores/vcs';
    import { Layout, Icon, Typography } from '@appwrite.io/pink-svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { writable } from 'svelte/store';
    import { ID, Runtime, Type } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { consoleVariables } from '$routes/(console)/store';
    import Details from '../(components)/details.svelte';
    import ProductionBranchFieldset from '$lib/components/git/productionBranchFieldset.svelte';
    import Configuration from './configuration.svelte';
    import Aside from '../(components)/aside.svelte';

    export let data;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = '';
    let id = ID.unique();
    let runtime: Models.Runtime = data.runtimesList.runtimes[0];
    let entrypoint = '';
    let buildCommand = '';
    let scopes: string[] = [];
    let branch: string;
    let rootDir = './';
    let variables: Partial<Models.Variable>[] = [];
    let silentMode = false;
    let domain = id;

    onMount(async () => {
        installation.set(data.installation);
        repository.set(data.repository);
        name = data.repository.name;
    });

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
                `${domain}.${$consoleVariables._APP_DOMAIN_TARGET}`,
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
                source: 'repository',
                framework: runtime.key
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
</script>

<svelte:head>
    <title>Create function - Appwrite</title>
</svelte:head>

<Wizard
    title="Create function"
    bind:showExitModal
    href={`${base}/project-${$page.params.project}/functions/`}
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xl">
            <Card radius="s" padding="s">
                <Layout.Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="xs">
                    <Layout.Stack direction="row" alignItems="center" gap="xs">
                        <Icon icon={IconGithub} color="--fgcolor-neutral-primary" />
                        <Typography.Text variation="m-500" color="--fgcolor-neutral-primary">
                            {data.repository?.organization}/{data.repository?.name}
                        </Typography.Text>
                    </Layout.Stack>
                    <Button
                        secondary
                        href={`${base}/project-${$page.params.project}/sites/create-site/repositories`}>
                        Change
                    </Button>
                </Layout.Stack>
            </Card>
            <Details bind:name bind:entrypoint bind:id bind:runtime />

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
                <ProductionBranchFieldset bind:branch bind:rootDir {options} bind:silentMode />
            {/await}

            <Configuration bind:buildCommand bind:scopes />
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside {runtime} repositoryName={data.repository.name} {branch} {rootDir} />
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            submissionLoader
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Create
        </Button>
    </svelte:fragment>
</Wizard>
