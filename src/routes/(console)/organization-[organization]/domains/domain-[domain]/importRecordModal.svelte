<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Icon, Layout, Tooltip, Typography, Upload } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { InvalidFileType, removeFile } from '$lib/helpers/files';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    export let show = false;
    let files: FileList;
    let error = '';

    async function handleSubmit() {
        try {
            if (!files?.length) return;

            const file = files[0];
            const content = await file.text();

            await sdk.forConsole.domains.updateZone(page.params.domain, content);
            invalidate(Dependencies.DOMAIN);
            show = false;
            addNotification({
                type: 'success',
                message: `DNS records have been imported successfully`
            });
            trackEvent(Submit.RecordCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.RecordCreate);
        }
    }

    function handleInvalid(e: CustomEvent) {
        const reason = e.detail.reason;
        if (reason === InvalidFileType.EXTENSION) {
            error = 'Only .tar.gz files allowed';
        } else if (reason === InvalidFileType.SIZE) {
            error = 'File size exceeds 10MB';
        } else {
            error = 'Invalid file';
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

<Modal title="Import zone file" bind:show bind:error onSubmit={handleSubmit}>
    <span slot="description">
        Import DNS zone file to apply its records to your domain. <b
            >If conflicts arise, the upload will be blocked</b
        >.
    </span>

    <Layout.Stack gap="xl">
        <Layout.Stack gap="s">
            <Typography.Text color="--fgcolor-neutral-primary">
                Upload a .txt file with your DNS records
            </Typography.Text>
            maxSize={10000000}
            <Upload.Dropzone
                bind:files
                extensions={['txt']}
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
                                <Layout.Stack alignItems="center" justifyContent="center" inline>
                                    <Icon icon={IconInfo} size="s" />
                                </Layout.Stack>
                                <svelte:fragment slot="tooltip"
                                    >Only .txt files allowed</svelte:fragment>
                            </Tooltip>
                        </Layout.Stack>
                        <Typography.Caption variant="400">Max file size 10MB</Typography.Caption>
                    </Layout.Stack>
                </Layout.Stack>
            </Upload.Dropzone>
        </Layout.Stack>
        {#if files?.length}
            <Upload.List
                bind:files={filesList}
                on:remove={(e) => (files = removeFile(e.detail, files))} />
        {/if}
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button size="s" submit disabled={!files?.length}>Import</Button>
    </svelte:fragment>
</Modal>
