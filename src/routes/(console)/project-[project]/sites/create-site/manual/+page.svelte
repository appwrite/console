<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Button, Form } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Layout, Icon, Upload, Typography, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { writable } from 'svelte/store';
    import Details from '../details.svelte';
    import Configuration from './configuration.svelte';
    import Aside from './aside.svelte';
    import { BuildRuntime, Framework, ID, Query } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { processFileList } from '$lib/helpers/files';
    import { createTarGzip } from 'nanotar';

    export let data;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = '';
    let id = '';
    let framework: Models.Framework = data.frameworks.frameworks[0];
    let adapter = framework?.adapters[0];
    let installCommand = adapter?.installCommand;
    let buildCommand = adapter?.buildCommand;
    let outputDirectory = adapter?.outputDirectory;
    let variables: Partial<Models.Variable>[] = [];
    let files: FileList;
    let uploadFile: File;

    async function handleChange() {
        const tick = performance.now();
        if (!files?.length) return;

        // If the file is a tar.gz file, then return it as is
        if (
            files?.length === 1 &&
            files.item(0).type === 'application/gzip' &&
            files.item(0).name.split('.').pop() === 'tar'
        ) {
            uploadFile = files.item(0);
        }
        // Else process the file to mantain the folder structure and create a .tar.gz file
        else {
            try {
                const processedFiles = await processFileList(files);
                const tar = await createTarGzip(
                    processedFiles.map((f) => ({
                        name: f.path,
                        data: f.buffer
                    }))
                );
                const blob = new Blob([tar], { type: 'application/gzip' });
                const file = new File([blob], 'deployment.tar.gz', { type: 'application/gzip' });
                uploadFile = file;
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e
                });
            }
        }
        console.log(uploadFile);
        const tock = performance.now();
        console.log('Time taken to process files:', tock - tick);
    }

    async function create() {
        try {
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
                installCommand,
                buildCommand,
                outputDirectory,
                undefined,
                framework.adapters[Object.keys(framework.adapters)[0]].key, //TODO: fix this
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
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
            <Upload.Dropzone folder bind:files on:change={handleChange}>
                <Layout.Stack alignItems="center" gap="s">
                    <Layout.Stack
                        alignItems="center"
                        justifyContent="center"
                        direction="row"
                        gap="s">
                        <Typography.Text variant="l-500">
                            Drag and drop files here or click to upload
                        </Typography.Text>
                        <Tooltip>
                            <Icon icon={IconInfo} size="s" />
                            <svelte:fragment slot="tooltip">
                                Only PNG, JPEG, PDF files allowed
                            </svelte:fragment>
                        </Tooltip>
                    </Layout.Stack>
                    <Typography.Caption variant="400">Max file size: 10MB</Typography.Caption>
                </Layout.Stack>
            </Upload.Dropzone>
            <Details bind:name bind:id />

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
