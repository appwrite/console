<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
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
    import { regionalConsoleVariables } from '../../../store';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { InvalidFileType, removeFile } from '$lib/helpers/files';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { isCloud } from '$lib/system';
    import { currentPlan } from '$lib/stores/organization';
    import Domain from '../domain.svelte';
    import { uploader } from '$lib/stores/uploader';

    export let data;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = 'My website';
    let id = ID.unique();
    let domain = data.domain;
    let domainIsValid = true;
    let framework: Models.Framework =
        data.frameworks.frameworks?.find((f) => f.key === 'other') ??
        data.frameworks.frameworks?.[0];
    let adapter = framework?.adapters[0];
    let installCommand = adapter?.installCommand;
    let buildCommand = adapter?.buildCommand;
    let outputDirectory = adapter?.outputDirectory;
    let variables: Partial<Models.Variable>[] = [];
    let files: FileList;

    $: maxSize =
        isCloud && $currentPlan
            ? $currentPlan.deploymentSize * 1000000
            : $regionalConsoleVariables._APP_COMPUTE_SIZE_LIMIT; // already in MB

    $: readableMaxSize = humanFileSize(maxSize);

    async function create() {
        let site: Models.Site | null = null;

        try {
            if (!domainIsValid) {
                addNotification({
                    type: 'error',
                    message: 'Domain is not valid'
                });
                return;
            }

            const fr = Object.values(Framework).find((f) => f === framework.key);
            const buildRuntime = Object.values(BuildRuntime).find(
                (f) => f === framework.buildRuntime
            );
            site = await sdk.forProject(page.params.region, page.params.project).sites.create({
                siteId: id || ID.unique(),
                name,
                framework: fr,
                buildRuntime,
                installCommand: installCommand || undefined,
                buildCommand: buildCommand || undefined,
                outputDirectory: outputDirectory || undefined
            });

            // Add domain
            await sdk.forProject(page.params.region, page.params.project).proxy.createSiteRule({
                domain: `${domain}.${$regionalConsoleVariables._APP_DOMAIN_SITES}`,
                siteId: site.$id
            });

            //Add variables
            const promises = variables.map((variable) =>
                sdk.forProject(page.params.region, page.params.project).sites.createVariable({
                    siteId: site.$id,
                    key: variable.key,
                    value: variable.value,
                    secret: variable?.secret ?? false
                })
            );
            await Promise.all(promises);

            const promise = uploader.uploadSiteDeployment({
                siteId: site.$id,
                code: files[0],
                buildCommand: buildCommand || undefined,
                installCommand: installCommand || undefined,
                outputDirectory: outputDirectory || undefined
            });

            addNotification({
                message: 'Deployment upload started',
                type: 'success'
            });
            trackEvent(Submit.SiteCreate, {
                source: 'manual',
                framework: framework.key
            });

            await promise;
            const upload = $uploader.files.find((f) => f.resourceId === site.$id);

            if (upload?.status === 'success') {
                const deploymentId = upload.$id;
                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/sites/create-site/deploying?site=${site.$id}&deployment=${deploymentId}`
                );
            }
        } catch (e) {
            const upload = $uploader.files.find((f) => f.resourceId === site?.$id);
            if (upload) {
                uploader.removeFromQueue(upload.$id);
            }
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.SiteCreate);
        }
    }

    function handleInvalid(e: CustomEvent) {
        const reason = e.detail?.reason ?? '';
        if (reason === InvalidFileType.EXTENSION) {
            addNotification({
                type: 'error',
                message: 'Only .tar.gz files allowed'
            });
        } else if (reason === InvalidFileType.SIZE) {
            addNotification({
                type: 'error',
                message: 'File size exceeds 10MB'
            });
        } else {
            addNotification({
                type: 'error',
                message: 'Invalid file'
            });
        }
    }

    $: filesList = files?.length
        ? Array.from(files).map((f) => {
              return {
                  ...f,
                  name: f.name,
                  size: f.size,
                  extension: f.type,
                  removable: true
              };
          })
        : [];
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<Wizard
    title="Create site"
    bind:showExitModal
    href={`${base}/project-${page.params.region}-${page.params.project}/sites/`}
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xl">
            <Layout.Stack gap="s">
                <Typography.Text color="--fgcolor-neutral-primary">
                    Upload a tar.gz containing your site source code
                </Typography.Text>
                <Upload.Dropzone
                    extensions={['gz', 'tar']}
                    bind:files
                    {maxSize}
                    required
                    on:invalid={handleInvalid}>
                    <Layout.Stack alignItems="center" gap="s">
                        <Layout.Stack alignItems="center" gap="s">
                            <Layout.Stack alignItems="center" justifyContent="center" inline>
                                <Typography.Text variant="l-500" align="center" inline>
                                    Drag and drop file here or click to upload;
                                    <Layout.Stack
                                        style="display: inline-flex; vertical-align: middle;"
                                        inline
                                        alignItems="center"
                                        justifyContent="center">
                                        <Tooltip>
                                            <Icon icon={IconInfo} size="s" />
                                            <svelte:fragment slot="tooltip"
                                                >Only .tar.gz files allowed</svelte:fragment>
                                        </Tooltip>
                                    </Layout.Stack>
                                </Typography.Text>
                            </Layout.Stack>
                            {#if maxSize > 0}
                                <Typography.Caption variant="400"
                                    >Max file size: {readableMaxSize.value +
                                        readableMaxSize.unit}</Typography.Caption>
                            {/if}
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

            <Domain bind:domain bind:domainIsValid />
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside template={data.template} />
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
