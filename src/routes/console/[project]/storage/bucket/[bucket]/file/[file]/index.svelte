<script lang="ts">
    import { Card, Alert } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button, InputTags } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { file } from './store';
    import { toLocaleDate } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import Delete from './_deleteFile.svelte';

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

    const copy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            addNotification({
                message: 'Copied to clipboard.',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };
</script>

<Container>
    {#if $file}
        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div class="u-flex u-gap-12">
                    <img width="205" height="125" src={getPreview($file.$id)} alt={$file.name} />
                    <div>
                        <h2 class="heading-level-7">{$file.name}</h2>
                        <Pill button on:click={() => copy(getView($file.$id))}
                            ><i class="icon-duplicate" />File URL
                        </Pill>
                    </div>
                </div>
                <div>
                    <p>MIME Type: {$file.mimeType}</p>
                    <p>Size: {$file.sizeOriginal}</p>
                    <p>Created: {toLocaleDate($file.dateCreated)}</p>
                    <p>Last Updated (to implement): {toLocaleDate($file.dateCreated)}</p>
                </div>
            </div>

            <div class="u-flex u-main-space-end common-section">
                <Button secondary href={downloadFile()}>
                    <span class="icon-download" aria-hidden="true" />
                    <span class="text"> Download</span></Button>
            </div>
        </Card>

        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div>
                    <h6 class="heading-level-7">Update Permissions</h6>
                    <p>
                        Assign read or write permissions at the Bucket Level or File Level. If
                        Bucket Level permissions are enabled, file permissions will be ignored.
                    </p>
                </div>
                <div>
                    <Alert type="info">
                        <svelte:fragment slot="title">
                            You have Bucket Level permissions enabled
                        </svelte:fragment>
                        <p>
                            If you want to assign permissions specific to this file, you will need
                            to update your <a class="link" href="#"> Bucket Settings</a> to enable File
                            Level permissions.
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
                </div>
            </div>
            <div class="u-flex u-main-space-end common-section">
                <Button
                    disabled={arePermsDisabled}
                    on:click={() => {
                        updatePermissions();
                    }}>Update</Button>
            </div>
        </Card>

        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div>
                    <h6 class="heading-level-7">Delete file</h6>
                    <p>
                        The file will be permanently deleted, including all the files within it.
                        This action is irreversible.
                    </p>
                </div>
                <div>
                    <div class="user-profile-button">
                        <span class="user-profile-info">
                            <h6 class="heading-level-7">{$file.name}</h6>
                            <p>Last Updated (to implement): {toLocaleDate($file.dateCreated)}</p>
                        </span>
                    </div>
                </div>
            </div>
            <div class="u-flex u-main-space-end common-section">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </div>
        </Card>
    {/if}
</Container>

<Delete bind:showDelete />
