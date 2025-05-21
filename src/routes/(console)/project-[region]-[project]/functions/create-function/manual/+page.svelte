<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Button, Form } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Icon, Layout, Tooltip, Typography, Upload } from '@appwrite.io/pink-svelte';
    import { writable } from 'svelte/store';
    import { ID, Runtime } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { consoleVariables } from '$routes/(console)/store';
    import Details from '../(components)/details.svelte';
    import Aside from '../(components)/aside.svelte';
    import { iconPath } from '$lib/stores/app';
    import { Dependencies } from '$lib/constants';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import Configuration from './configuration.svelte';
    import { getIconFromRuntime } from '$lib/stores/runtimes';
    import { InvalidFileType, removeFile } from '$lib/helpers/files';

    export let data;

    const runtimeOptions = data.runtimesList.runtimes.map((runtime) => {
        return {
            value: runtime.$id,
            label: `${runtime.name} - ${runtime.version}`,
            leadingHtml: `<img src='${$iconPath(getIconFromRuntime(runtime.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
        };
    });

    const specificationOptions = data.specificationsList.specifications.map((size) => ({
        label:
            `${size.cpus} CPU, ${size.memory} MB RAM` +
            (!size.enabled ? ` (Upgrade to use this)` : ''),
        value: size.slug,
        disabled: !size.enabled
    }));
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = '';
    let id: string;
    let runtime: Runtime;
    let entrypoint = '';
    let buildCommand = '';
    let roles: string[] = [];
    let variables: Partial<Models.Variable>[] = [];
    let files: FileList;
    let specification = specificationOptions[0].value;

    async function create() {
        try {
            const func = await sdk
                .forProject(page.params.region, page.params.project)
                .functions.create(
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
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    specification || undefined
                );

            // Add domain
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.createFunctionRule(
                    `${ID.unique()}.${$consoleVariables._APP_DOMAIN_FUNCTIONS}`,
                    func.$id
                );

            //Add variables
            const promises = variables.map((variable) =>
                sdk
                    .forProject(page.params.region, page.params.project)
                    .functions.createVariable(
                        func.$id,
                        variable.key,
                        variable.value,
                        variable?.secret ?? false
                    )
            );
            await Promise.all(promises);

            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.createDeployment(func.$id, files[0], true, undefined, undefined);

            trackEvent(Submit.FunctionCreate, {
                source: 'repository',
                runtime: runtime
            });

            await goto(
                `${base}/project-${page.params.region}-${page.params.project}/functions/function-${func.$id}`
            );

            invalidate(Dependencies.FUNCTION);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.FunctionCreate);
        }
    }

    function handleInvalid(e: CustomEvent) {
        const reason = e.detail.reason;
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
    <title>Create function - Appwrite</title>
</svelte:head>

<Wizard
    title="Create function"
    bind:showExitModal
    href={`${base}/project-${page.params.region}-${page.params.project}/functions`}
    column
    columnSize="s"
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xl">
            <Layout.Stack gap="s">
                <Typography.Text color="--fgcolor-neutral-primary">
                    Upload a tar.gz file containing your function source code
                </Typography.Text>
                <Upload.Dropzone
                    bind:files
                    title="Upload function"
                    extensions={['gz', 'tar']}
                    maxSize={10000000}
                    required
                    on:invalid={handleInvalid}>
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
                    <!-- TODO: torsten, the types issue with FileList-->
                    <Upload.List
                        bind:files={filesList}
                        on:remove={(e) => (files = removeFile(e.detail, files))} />
                {/if}
            </Layout.Stack>

            <Details
                bind:name
                bind:entrypoint
                bind:id
                bind:runtime
                bind:specification
                {specificationOptions}
                options={runtimeOptions}
                showEntrypoint />

            <Configuration bind:buildCommand bind:roles />
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
