<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Button, Form } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Icon, Layout, Tooltip, Typography, Upload } from '@appwrite.io/pink-svelte';
    import { writable } from 'svelte/store';
    import Details from '../details.svelte';
    import Aside from './aside.svelte';
    import { BuildRuntime, Framework, ID } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import Configuration from '../configuration.svelte';
    import { buildVerboseDomain } from '../store';
    import { project } from '$routes/(console)/project-[project]/store';
    import { organization } from '$lib/stores/organization';
    import { consoleVariables } from '$routes/(console)/store';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { removeFile } from '$lib/helpers/files';

    export let data;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = 'My website';
    let id = ID.unique();
    let domain = id;
    let framework: Models.Framework =
        data.frameworks.frameworks?.find((f) => f.key === 'other') ??
        data.frameworks.frameworks?.[0];
    let adapter = framework?.adapters[0];
    let installCommand = adapter?.installCommand;
    let buildCommand = adapter?.buildCommand;
    let outputDirectory = adapter?.outputDirectory;
    let variables: Partial<Models.Variable>[] = [];
    let files: FileList;

    async function create() {
        try {
            domain = await buildVerboseDomain(name, $project.name, $organization.name, id);

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
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            );

            // Add domain
            await sdk.forProject.proxy.createSiteRule(
                `${domain}.${$consoleVariables._APP_DOMAIN_SITES}`,
                site.$id
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

    $: filesList = files?.length
        ? Array.from(files).map((file) => {
              let f = file as Partial<File> & { removable: boolean };
              f.removable = true;
              return f;
          })
        : [];

    $: console.log(files);
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<!-- TODO: re enable aside -->
<Wizard
    title="Create site"
    bind:showExitModal
    href={`${base}/project-${$page.params.project}/sites/`}
    column
    columnSize="s"
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xl">
            <Layout.Stack gap="s">
                <Typography.Text color="--fgcolor-neutral-primary">
                    Upload a tar.gz containing your function source code
                </Typography.Text>
                <Upload.Dropzone extensions={['gz', 'tar']} bind:files maxSize={10000000} required>
                    <Layout.Stack alignItems="center" gap="s">
                        <Layout.Stack alignItems="center" gap="s">
                            <Layout.Stack
                                alignItems="center"
                                justifyContent="center"
                                direction="row"
                                gap="s">
                                <Typography.Text variant="l-500">
                                    Drag and drop file here or click to upload
                                </Typography.Text>
                                <Tooltip>
                                    <Layout.Stack
                                        alignItems="center"
                                        justifyContent="center"
                                        inline>
                                        <Icon icon={IconInfo} size="s" />
                                    </Layout.Stack>
                                    <svelte:fragment slot="tooltip"
                                        >Only .tar.gz files allowed</svelte:fragment>
                                </Tooltip>
                            </Layout.Stack>
                            <Typography.Caption variant="400"
                                >Max file size 10MB</Typography.Caption>
                        </Layout.Stack>
                    </Layout.Stack>
                </Upload.Dropzone>
                {#if files?.length}
                    <Upload.List
                        bind:files={filesList}
                        on:remove={(e) => (files = removeFile(e.detail, files))} />
                {/if}
            </Layout.Stack>
            <Details bind:name bind:id />

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
