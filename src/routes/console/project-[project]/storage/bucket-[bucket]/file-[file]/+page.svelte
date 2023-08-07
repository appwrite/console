<script lang="ts">
    import { CardGrid, Box, Heading, Alert, Id } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { file } from './store';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
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
    import LL from '$i18n/i18n-svelte';

    let showFileAlert = true;
    onMount(async () => {
        filePermissions = $file?.$permissions;
    });

    let showDelete = false;
    let filePermissions = $file?.$permissions;
    let arePermsDisabled = true;

    const getPreview = (fileId: string) =>
        sdk.forProject.storage.getFilePreview($file.bucketId, fileId, 205, 125).toString() +
        '&mode=admin';
    const getView = (fileId: string) =>
        sdk.forProject.storage.getFileView($file.bucketId, fileId).toString() + '&mode=admin';

    $: if (filePermissions) {
        if (symmetricDifference(filePermissions, $file.$permissions).length) {
            arePermsDisabled = false;
        } else arePermsDisabled = true;
    }

    function downloadFile() {
        return (
            sdk.forProject.storage.getFileDownload($file.bucketId, $file.$id).toString() +
            '&mode=admin'
        );
    }

    async function updatePermissions() {
        try {
            await sdk.forProject.storage.updateFile($file.bucketId, $file.$id, filePermissions);
            await invalidate(Dependencies.FILE);
            arePermsDisabled = true;
            addNotification({
                message: $LL.components.notification.permissionsUpdated(),
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
                    <Id value={getView($file.$id)}>File URL</Id>
                </div>
            </div>
            <svelte:fragment slot="aside">
                <div>
                    <p>{$LL.console.project.texts.storage.mime()} {$file.mimeType}</p>
                    <p>
                        {$LL.console.project.texts.storage.size()}
                        {calculateSize($file.sizeOriginal)}
                    </p>
                    <p>
                        {$LL.console.project.texts.storage.created()}
                        {toLocaleDate($file.$createdAt)}
                    </p>
                    <p>
                        {$LL.console.project.texts.storage.lastUpdated()}
                        {toLocaleDate($file.$updatedAt)}
                    </p>
                </div>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary href={downloadFile()} event="download_file">
                    <span class="icon-download" aria-hidden="true" />
                    <span class="text">{$LL.console.project.button.delete()}</span></Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.project.title.permissions()}</Heading>
            <p>
                {$LL.console.project.texts.storage.readWritePermission()}
            </p>
            <svelte:fragment slot="aside">
                {#if $bucket.fileSecurity}
                    {#if showFileAlert}
                        <Alert type="info" dismissible on:dismiss={() => (showFileAlert = false)}>
                            <svelte:fragment slot="title"
                                >{$LL.console.project.texts.storage.fileSecurity.enable()}</svelte:fragment>
                            <p class="text">
                                {$LL.console.project.texts.storage.userAccessability()}
                                <b
                                    >{$LL.console.project.texts.storage.fileAndBucketPermissionss()}
                                </b>
                            </p>
                        </Alert>
                    {/if}
                    <Permissions bind:permissions={filePermissions} />
                {:else}
                    <Alert type="info">
                        <svelte:fragment slot="title"
                            >{$LL.console.project.texts.storage.fileSecurity.disable()}</svelte:fragment>
                        <p class="text">
                            {$LL.console.project.texts.storage.assignFilePermission()}
                        </p>
                    </Alert>
                {/if}
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={arePermsDisabled}
                    on:click={() => {
                        updatePermissions();
                    }}>{$LL.console.project.button.update()}</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid danger>
            <Heading tag="h6" size="7">{$LL.console.project.title.deleteFile()}</Heading>
            <p>{$LL.console.project.texts.storage.permanentDeleteFile()}</p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1" data-private>{$file.name}</h6>
                    </svelte:fragment>
                    <p>
                        {$LL.console.project.texts.storage.lastUpdated()}
                        {toLocaleDateTime($file.$updatedAt)}
                    </p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)} event="delete_file">
                    {$LL.console.project.button.submit.delete()}
                </Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
