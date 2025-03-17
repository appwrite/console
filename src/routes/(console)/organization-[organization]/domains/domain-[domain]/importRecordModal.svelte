<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Icon, Layout, Tooltip, Typography, Upload } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

    export let show = false;
    let files: FileList;
    let error = '';

    async function handleSubmit() {
        try {
            //TODO: create DNS records

            show = false;
            addNotification({
                type: 'success',
                message: `Presets have been added`
            });
            trackEvent(Submit.RecordCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.RecordCreate);
        }
    }
</script>

<Modal title="Import zone file" bind:show bind:error onSubmit={handleSubmit}>
    <span slot="description">
        Import DNS zone file to apply its records to your domain. <b
            >If conflicts arise, the upload will be blocked</b
        >.
    </span>

    <Upload.Dropzone bind:files>
        <Layout.Stack alignItems="center" gap="s">
            <Layout.Stack alignItems="center" gap="s">
                <Layout.Stack alignItems="center" justifyContent="center" direction="row" gap="s">
                    <Typography.Text variant="l-500">
                        Drag and drop file here or click to upload
                    </Typography.Text>
                    <Tooltip>
                        <Layout.Stack alignItems="center" justifyContent="center" inline>
                            <Icon icon={IconInfo} size="s" />
                        </Layout.Stack>
                        <svelte:fragment slot="tooltip">Only .txt files allowed</svelte:fragment>
                    </Tooltip>
                </Layout.Stack>
                <Typography.Caption variant="400">Max file size 10MB</Typography.Caption>
            </Layout.Stack>
        </Layout.Stack>
    </Upload.Dropzone>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button size="s" submit disabled={!files?.length}>Import</Button>
    </svelte:fragment>
</Modal>
