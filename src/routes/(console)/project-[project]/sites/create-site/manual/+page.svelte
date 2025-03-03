<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Button, Form } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { writable } from 'svelte/store';
    import Details from '../details.svelte';
    import Aside from './aside.svelte';
    import { BuildRuntime, Framework, ID } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import Configuration from '../configuration.svelte';
    import InputFile from '$lib/elements/forms/inputFile.svelte';
    import { buildVerboseDomain } from '../store';
    import { project } from '$routes/(console)/project-[project]/store';

    export let data;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = 'My website';
    let id = ID.unique();
    let domain = id;
    let framework: Models.Framework = data.frameworks.frameworks[0];
    let adapter = framework?.adapters[0];
    let installCommand = adapter?.installCommand;
    let buildCommand = adapter?.buildCommand;
    let outputDirectory = adapter?.outputDirectory;
    let variables: Partial<Models.Variable>[] = [];
    let files: FileList;

    async function create() {
        try {
            domain = await buildVerboseDomain(name, $project.name, id);

            const fr = Object.values(Framework).find((f) => f === framework.key);
            const buildRuntime = Object.values(BuildRuntime).find(
                (f) => f === framework.buildRuntime
            );
            let site = await sdk.forProject.sites.create(
                id || ID.unique(),
                name,
                fr,
                buildRuntime,
                undefined,
                undefined,
                installCommand || undefined,
                buildCommand || undefined,
                outputDirectory || undefined,
                framework.adapters[Object.keys(framework.adapters)[0]].key, //TODO: fix this
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            );

            //Add variables
            const promises = variables.map((variable) =>
                sdk.forProject.sites.createVariable(
                    site.$id,
                    variable.key,
                    variable.value,
                    variable?.secret ?? false
                )
            );
            await Promise.all(promises);

            const deployment = await sdk.forProject.sites.createDeployment(
                site.$id,
                files[0],
                true,
                installCommand || undefined,
                buildCommand || undefined,
                outputDirectory || undefined
            );

            trackEvent(Submit.SiteCreate, {
                source: 'manual',
                framework: framework.key
            });

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
            <Layout.Stack gap="xxs">
                <InputFile
                    label="Upload a zip file (tar.gz) containing your function source code"
                    allowedFileExtensions={['gz']}
                    bind:files
                    required />
            </Layout.Stack>
            <Details bind:name bind:id />

            <Configuration
                bind:installCommand
                bind:buildCommand
                bind:outputDirectory
                bind:selectedFramework={framework}
                bind:variables
                frameworks={data.frameworks.frameworks} />

            <!-- <Domain bind:domain bind:domainIsValid /> -->
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside />
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button size="s" fullWidthMobile secondary on:click={() => (showExitModal = true)}>
            Cancel
        </Button>
        <Button
            size="s"
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Deploy
        </Button>
    </svelte:fragment>
</Wizard>
