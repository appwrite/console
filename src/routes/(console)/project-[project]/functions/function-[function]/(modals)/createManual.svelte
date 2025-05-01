<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { removeFile } from '$lib/helpers/files';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Tooltip, Typography, Upload } from '@appwrite.io/pink-svelte';
    import { func } from '../store';

    export let show = false;

    let files: FileList;
    let error: string = '';

    async function create() {
        try {
            await sdk.forProject.functions.createDeployment(
                $func.$id,
                files[0],
                true,
                undefined,
                undefined
            );
            await invalidate(Dependencies.DEPLOYMENTS);
            files = undefined;
            show = false;
            trackEvent(Submit.DeploymentCreate);
            addNotification({
                type: 'success',
                message: 'Deployment created successfully'
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DeploymentCreate);
        }
    }

    $: filesList = files?.length
        ? Array.from(files).map((f) => {
              return {
                  ...f,
                  extension: f.type,
                  removable: true
              };
          })
        : [];
</script>

<Modal title="Create manual deployment" bind:show onSubmit={create} {error}>
    <span slot="description"> Manually deploy a function by uploading any file(s) or folder. </span>
    <Layout.Stack gap="s">
        <Typography.Text color="--fgcolor-neutral-primary">
            Upload a tar.gz file containing your function source code
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
                            <Layout.Stack alignItems="center" justifyContent="center" inline>
                                <Icon icon={IconInfo} size="s" />
                            </Layout.Stack>
                            <svelte:fragment slot="tooltip"
                                >Only .tar.gz files allowed</svelte:fragment>
                        </Tooltip>
                    </Layout.Stack>
                    <Typography.Caption variant="400">Max file size 10MB</Typography.Caption>
                </Layout.Stack>
            </Layout.Stack>
        </Upload.Dropzone>
        {#if files?.length}
            <Upload.List
                bind:files={filesList}
                on:remove={(e) => (files = removeFile(e.detail, files))} />
        {/if}
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
        <Button size="s" disabled={!(files ?? [])[0]} submit submissionLoader>Create</Button>
    </svelte:fragment>
</Modal>
