<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Framework, Models } from '@appwrite.io/console';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Tooltip, Typography, Upload } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let site: Models.Site;

    let files: FileList;
    async function createDeployment() {
        try {
            await sdk.forProject.sites.createDeployment(
                site.$id,
                files,
                true, //TODO: fix
                undefined,
                undefined,
                undefined,
                'test'
            );
            show = false;
            invalidate(Dependencies.DEPLOYMENTS);
            addNotification({
                message: 'Deployment has been created successfully',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    $: console.log(files);
</script>

<Modal title="Create manual deployment" bind:show onSubmit={createDeployment}>
    <span slot="description"> Manually deploy a site by uploading any file(s) or folder. </span>
    <Upload.Dropzone multiple bind:files>
        <Layout.Stack alignItems="center" gap="s">
            <Layout.Stack alignItems="center" justifyContent="center" direction="row" gap="s">
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
    <svelte:fragment slot="footer">
        <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
        <Button size="s">Create</Button>
    </svelte:fragment>
</Modal>
