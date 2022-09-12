<script lang="ts">
    import { Alert, CardGrid, Box, Copy } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button, InputTags } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { file } from './store';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import Delete from './_deleteFile.svelte';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    onMount(async () => {
        let bucketId = $page.params.bucket;
        let fileId = $page.params.file;
        await file.load(bucketId, fileId);
        fileRead = $file?.$read;
        fileWrite = $file?.$write;
    });

    let showDelete = false;
    let fileRead = $file?.$read;
    let fileWrite = $file?.$write;
    let arePermsDisabled = true;

    const getPreview = (fileId: string) =>
        sdkForProject.storage.getFilePreview($file.bucketId, fileId, 205, 125).toString() +
        '&mode=admin';
    const getView = (fileId: string) =>
        sdkForProject.storage.getFileView($file.bucketId, fileId).toString() + '&mode=admin';

    $: if (fileRead || fileWrite) {
        if (fileRead) {
            if (JSON.stringify(fileRead) !== JSON.stringify($file.$read)) {
                arePermsDisabled = false;
            } else arePermsDisabled = true;
        } else if (fileWrite) {
            if (JSON.stringify(fileWrite) !== JSON.stringify($file.$write)) {
                arePermsDisabled = false;
            } else arePermsDisabled = true;
        }
    }

    function downloadFile() {
        return (
            sdkForProject.storage.getFileDownload($file.bucketId, $file.$id).toString() +
            '&mode=admin'
        );
    }
    function getFileView(fileId: string) {
        return sdkForProject.storage.getFileView($file.bucketId, fileId).toString() + '&mode=admin';
    }

    async function updatePermissions() {
        try {
            await sdkForProject.storage.updateFile($file.bucketId, $file.$id, fileRead, fileWrite);
            $file.$read = fileRead;
            $file.$write = fileWrite;
            arePermsDisabled = true;
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
</script>

<Container>
    {#if $file}
        <CardGrid>
            <div class="u-flex u-gap-16">
                <a
                    href={getFileView($file.$id)}
                    class="file-preview is-with-image"
                    target="_blank"
                    aria-label="open file in new window">
                    <div class="file-preview-image">
                        <img
                            width="205"
                            height="125"
                            src={getPreview($file.$id)}
                            alt={$file.name} />
                    </div>
                    <div class="file-preview-content">
                        <div class="avatar">
                            <span class="icon-external-link" aria-hidden="true" />
                        </div>
                    </div>
                </a>
                <div>
                    <h2 class="heading-level-7">{$file.name}</h2>
                    <Copy value={getView($file.$id)}>
                        <Pill button><i class="icon-duplicate" />File URL</Pill>
                    </Copy>
                </div>
            </div>
            <svelte:fragment slot="aside">
                <div>
                    <p>MIME Type: {$file.mimeType}</p>
                    <p>Size: {calculateSize($file.sizeOriginal)}</p>
                    <p>Created: {toLocaleDate($file.$createdAt)}</p>
                    <p>Last Updated: {toLocaleDate($file.$updatedAt)}</p>
                </div>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary href={downloadFile()}>
                    <span class="icon-download" aria-hidden="true" />
                    <span class="text"> Download</span></Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <h6 class="heading-level-7">Update Permissions</h6>
            <p>
                Assign read or write permissions at the Bucket Level or File Level. If Bucket Level
                permissions are enabled, file permissions will be ignored.
            </p>
            <svelte:fragment slot="aside">
                <Alert type="info">
                    <svelte:fragment slot="title">
                        You have Bucket Level permissions enabled
                    </svelte:fragment>
                    <p>
                        If you want to assign permissions specific to this file, you will need to
                        update your <a class="link" href="#/"> Bucket Settings</a> to enable File Level
                        permissions.
                    </p>
                </Alert>
                <ul class="common-section">
                    <InputTags
                        id="read"
                        label="Read Access"
                        placeholder="User ID, Team ID, or Role"
                        bind:tags={fileRead} />
                    <InputTags
                        id="write"
                        label="Write Access"
                        placeholder="User ID, Team ID, or Role"
                        bind:tags={fileWrite} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={arePermsDisabled}
                    on:click={() => {
                        updatePermissions();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <h6 class="heading-level-7">Delete file</h6>
            <p>
                The file will be permanently deleted, including all the files within it. This action
                is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold">{$file.name}</h6>
                    </svelte:fragment>
                    <p>
                        Last Updated: {toLocaleDateTime($file.$updatedAt)}
                    </p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
