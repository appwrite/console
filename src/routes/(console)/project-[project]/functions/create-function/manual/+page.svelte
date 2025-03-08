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
    import { ID, Runtime, Type } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { consoleVariables } from '$routes/(console)/store';
    import Details from '../(components)/details.svelte';
    import Aside from '../(components)/aside.svelte';
    import { iconPath } from '$lib/stores/app';
    import { getIconFromRuntime } from '../../store';
    import { Dependencies } from '$lib/constants';

    export let data;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = '';
    let id = ID.unique();
    let runtime: Runtime;
    let entrypoint = '';
    let buildCommand = '';
    let scopes: string[] = [];
    let branch: string;
    let rootDir = './';
    let variables: Partial<Models.Variable>[] = [];
    let silentMode = false;

    async function create() {
        try {
            const rt = Object.values(Runtime).find((r) => r === runtime);
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

            await sdk.forProject.functions.createVcsDeployment(func.$id, Type.Branch, branch, true);

            trackEvent(Submit.FunctionCreate, {
                source: 'repository',
                runtime: runtime
            });

            await goto(`${base}/project-${$page.params.project}/functions/function=${func.$id}`);

            invalidate(Dependencies.FUNCTION);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.FunctionCreate);
        }
    }

    const runtimeOptions = data.runtimesList.runtimes.map((runtime) => {
        return {
            value: runtime.name,
            label: `${runtime.name} - ${runtime.version}`,
            leadingHtml: `<img src='${$iconPath(getIconFromRuntime(runtime.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
        };
    });
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
            <Details
                bind:name
                bind:entrypoint
                bind:id
                bind:runtime
                options={runtimeOptions}
                showEntrypoint />

            <!-- <Configuration bind:buildCommand bind:scopes /> -->
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside {runtime} runtimes={data.runtimesList} showGitData={false} />
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
