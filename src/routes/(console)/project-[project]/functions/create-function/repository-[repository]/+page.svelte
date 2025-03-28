<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Button, Form } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { writable } from 'svelte/store';
    import { ID, Runtime, VCSDeploymentType } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { consoleVariables } from '$routes/(console)/store';
    import Details from '../(components)/details.svelte';
    import ProductionBranchFieldset from '$lib/components/git/productionBranchFieldset.svelte';
    import Configuration from './configuration.svelte';
    import Aside from '../(components)/aside.svelte';
    import { iconPath } from '$lib/stores/app';
    import { Dependencies } from '$lib/constants';
    import RepoCard from './repoCard.svelte';
    import { getIconFromRuntime } from '$lib/stores/runtimes';

    export let data;

    const specificationOptions = data.specificationsList.specifications.map((size) => ({
        label:
            `${size.cpus} CPU, ${size.memory} MB RAM` +
            (!size.enabled ? ` (Upgrade to use this)` : ''),
        value: size.slug,
        disabled: !size.enabled
    }));
    const runtimeOptions = data.runtimesList.runtimes.map((runtime) => {
        return {
            value: runtime.$id,
            label: `${runtime.name} - ${runtime.version}`,
            leadingHtml: `<img src='${$iconPath(getIconFromRuntime(runtime.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
        };
    });

    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = '';
    let id: string;
    let runtime: Runtime;
    let entrypoint = '';
    let buildCommand = '';
    let roles: string[] = [];
    let branch: string;
    let rootDir = './';
    let variables: Partial<Models.Variable>[] = [];
    let silentMode = false;
    let specification = specificationOptions[0].value;

    onMount(async () => {
        installation.set(data.installation);
        repository.set(data.repository);
        name = data.repository.name;
    });

    async function create() {
        try {
            const func = await sdk.forProject.functions.create(
                id || ID.unique(),
                name,
                runtime,
                roles?.length ? roles : undefined,
                undefined,
                undefined,
                undefined,
                true,
                undefined,
                entrypoint,
                buildCommand,
                undefined,
                $installation.$id,
                $repository.id,
                branch,
                silentMode,
                rootDir,
                specification || undefined
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

            await sdk.forProject.functions.createVcsDeployment(
                func.$id,
                VCSDeploymentType.Branch,
                branch,
                true
            );

            trackEvent(Submit.FunctionCreate, {
                source: 'repository',
                runtime: runtime
            });

            await goto(`${base}/project-${$page.params.project}/functions/function-${func.$id}`);

            invalidate(Dependencies.FUNCTION);
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
    href={`${base}/project-${$page.params.project}/functions`}
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xl">
            <RepoCard repository={data.repository} />

            <Details
                bind:name
                bind:entrypoint
                bind:id
                bind:runtime
                bind:specification
                {specificationOptions}
                options={runtimeOptions}
                showEntrypoint />

            <ProductionBranchFieldset
                bind:branch
                bind:rootDir
                bind:silentMode
                product="functions"
                installationId={data.installation.$id}
                repositoryId={data.repository.id} />

            <Configuration bind:buildCommand bind:roles />
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside
            {runtime}
            runtimes={data.runtimesList}
            repositoryName={data.repository.name}
            {branch}
            {rootDir} />
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            submissionLoader
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Deploy
        </Button>
    </svelte:fragment>
</Wizard>
