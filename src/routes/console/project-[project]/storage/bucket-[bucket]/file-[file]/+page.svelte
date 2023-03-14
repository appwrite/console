<script lang="ts">
    import { CardGrid, Box, Copy, Heading, Alert } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { file } from './store';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { onMount } from 'svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Permissions } from '$lib/components/permissions';
    import Delete from './deleteFile.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { bucket } from '../store';

    let showFileAlert = true;
    onMount(async () => {
        filePermissions = $file?.$permissions;
    });

    let showDelete = false;
    let filePermissions = $file?.$permissions;
    let arePermsDisabled = true;

    const getPreview = (fileId: string) =>
        sdkForProject.storage.getFilePreview($file.bucketId, fileId, 205, 125).toString() +
        '&mode=admin';
    const getView = (fileId: string) =>
        sdkForProject.storage.getFileView($file.bucketId, fileId).toString() + '&mode=admin';

    $: if (filePermissions) {
        if (symmetricDifference(filePermissions, $file.$permissions).length) {
            arePermsDisabled = false;
        } else arePermsDisabled = true;
    }

    function downloadFile() {
        return (
            sdkForProject.storage.getFileDownload($file.bucketId, $file.$id).toString() +
            '&mode=admin'
        );
    }

    async function updatePermissions() {
        try {
            await sdkForProject.storage.updateFile($file.bucketId, $file.$id, filePermissions);
            invalidate(Dependencies.FILE);
            arePermsDisabled = true;
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent(Submit.FileUpdatePermissions);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FileUpdatePermissions);
        }
    }
</script>

<Container>
    {#if $file}
        <CardGrid>
            <div class="u-flex u-gap-16" data-private>
                <a
                    href={getView($file.$id)}
                    class="file-preview is-with-image"
                    target="_blank"
                    rel="noopener noreferrer"
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
                <div class="u-flex u-flex-vertical u-gap-16">
                    <Heading tag="h2" size="7">{$file.name}</Heading>
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
                <Button secondary href={downloadFile()} event="download_file">
                    <span class="icon-download" aria-hidden="true" />
                    <span class="text"> Download</span></Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <Heading tag="h6" size="7">Permissions</Heading>
            <p>
                Assign read or write permissions at the Bucket Level or File Level. If Bucket Level
                permissions are enabled, file permissions will be ignored.
            </p>
            <svelte:fragment slot="aside">
                {#if $bucket.fileSecurity}
                    {#if showFileAlert}
                        <Alert type="info" dismissible on:dismiss={() => (showFileAlert = false)}>
                            <svelte:fragment slot="title">File security is enabled</svelte:fragment>
                            <p class="text">
                                Users will be able to access this file if they have been granted <b
                                    >either File or Bucket permissions.
                                </b>
                            </p>
                        </Alert>
                    {/if}
                    <Permissions bind:permissions={filePermissions} />
                {:else}
                    <Alert type="info">
                        <svelte:fragment slot="title">File security is disabled</svelte:fragment>
                        <p class="text">
                            If you want to assign document permissions, navigate to Bucket settings
                            and enable file security. Otherwise, only Bucket permissions will be
                            used.
                        </p>
                    </Alert>
                {/if}
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={arePermsDisabled}
                    on:click={() => {
                        updatePermissions();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid danger>
            <Heading tag="h6" size="7">Delete File</Heading>
            <p>The file will be permanently deleted. This action is irreversible.</p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1" data-private>{$file.name}</h6>
                    </svelte:fragment>
                    <p>
                        Last Updated: {toLocaleDateTime($file.$updatedAt)}
                    </p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)} event="delete_file">
                    Delete
                </Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
