<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { removeFile } from '$lib/helpers/files';
    import { addNotification } from '$lib/stores/notifications';
    import { uploader } from '$lib/stores/uploader';
    import type { Models } from '@appwrite.io/console';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Tooltip, Typography, Upload } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let site: Models.Site;

    let files: FileList;
    let error: string = '';

    async function createDeployment() {
        try {
            uploader.uploadSiteDeployment(site.$id, files[0]);
            show = false;
            invalidate(Dependencies.DEPLOYMENTS);
            addNotification({
                message: 'Deployment upload started',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    $: filesList = files?.length
        ? Array.from(files).map((file) => {
              let f = file as Partial<File> & { removable: boolean };
              f.removable = true;
              return f;
          })
        : [];
</script>

<Modal title="Create manual deployment" bind:show onSubmit={createDeployment} {error}>
    <span slot="description"> Manually deploy a site by uploading any file(s) or folder. </span>
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
