<script lang="ts">
    import { CardGrid, Box, Copy, Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { file } from './store';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { onMount } from 'svelte';
    import { difference } from '$lib/helpers/array';
    import { Permissions } from '$lib/components/permissions';
    import Delete from './deleteFile.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

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
        if (
            difference(filePermissions, $file.$permissions).length ||
            difference($file.$permissions, filePermissions).length
        ) {
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
                    href={downloadFile()}
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
                <div>
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
                <Button secondary href={downloadFile()}>
                    <span class="icon-download" aria-hidden="true" />
                    <span class="text"> Download</span></Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <Heading tag="h6" size="7">Update Permissions</Heading>
            <p>
                Assign read or write permissions at the Bucket Level or File Level. If Bucket Level
                permissions are enabled, file permissions will be ignored.
            </p>
            <svelte:fragment slot="aside">
                <Permissions bind:permissions={filePermissions} />
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
            <Heading tag="h6" size="7">Delete File</Heading>
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
