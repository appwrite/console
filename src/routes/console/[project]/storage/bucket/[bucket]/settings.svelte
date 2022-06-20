<script lang="ts">
    import { Card, Alert } from '$lib/components';
    import { Container } from '$lib/layout';
    import {
        Button,
        InputText,
        InputTags,
        InputNumber,
        InputSelect,
        InputSwitch,
        Helper
    } from '$lib/elements/forms';
    import { bucket } from './store';
    import { toLocaleDate } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import Delete from './_deleteBucket.svelte';
    import { bind } from 'svelte/internal';

    let showDelete = false;
    let showError: false | 'name' | 'size' = false;
    let errorMessage = 'Something went wrong';
    let errorType: 'error' | 'warning' | 'success' = 'error';
    let enabled = $bucket.enabled;
    let bucketName = '';
    let bucketPermissions = $bucket.permission;
    let bucketRead = $bucket.$read;
    let bucketWrite = $bucket.$write;
    let arePermsDisabled = true;
    let encryption = $bucket.encryption;
    let antivirus = $bucket.antivirus;
    let maxSize: number;
    let options = [
        { label: 'Bytes', value: 'b' },
        { label: 'Kilobytes', value: 'kb' },
        { label: 'Megabytes', value: 'mb' },
        { label: 'Gigabytes', value: 'gb' }
    ];
    let extensions = $bucket.allowedFileExtensions;
    let isExtensionsDisabled = true;

    $: if (bucketPermissions || bucketRead || bucketWrite) {
        if (bucketPermissions !== $bucket.permission) {
            arePermsDisabled = false;
        } else if (bucketRead) {
            if (JSON.stringify(bucketRead) !== JSON.stringify($bucket.$read)) {
                arePermsDisabled = false;
            } else arePermsDisabled = true;
        } else if (bucketWrite) {
            if (JSON.stringify(bucketWrite) !== JSON.stringify($bucket.$write)) {
                arePermsDisabled = false;
            } else arePermsDisabled = true;
        }
    }
    $: if (extensions) {
        if (JSON.stringify(extensions) !== JSON.stringify($bucket.allowedFileExtensions)) {
            isExtensionsDisabled = false;
        } else isExtensionsDisabled = true;
    }

    function addError(location: typeof showError, message: string, type: typeof errorType) {
        showError = location;
        errorMessage = message;
        errorType = type;
    }

    async function toggleBucket() {
        try {
            await sdkForProject.storage.updateBucket(
                $bucket.$id,
                $bucket.name,
                $bucket.permission,
                $bucket.$read,
                $bucket.$write,
                enabled
            );
            $bucket.enabled = enabled;
            addNotification({
                message: `${$bucket.name} has been updatede`,
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updateName() {
        try {
            await sdkForProject.storage.updateBucket($bucket.$id, $bucket.name, $bucket.permission);
            $bucket.name = bucketName;
            bucketName = null;
            showError = false;
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
        } catch (error) {
            addError('name', error.message, 'error');
        }
    }
    async function updatePermissions() {
        try {
            await sdkForProject.storage.updateBucket(
                $bucket.$id,
                $bucket.name,
                bucketPermissions,
                bucketPermissions === 'bucket' ? bucketRead : $bucket.$read,
                bucketPermissions === 'bucket' ? bucketWrite : $bucket.$write
            );
            $bucket.permission = bucketPermissions;
            $bucket.$read = bucketRead;
            $bucket.$write = bucketWrite;
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

    async function updateSecurity() {
        try {
            await sdkForProject.storage.updateBucket(
                $bucket.$id,
                $bucket.name,
                $bucket.permission,
                $bucket.$read,
                $bucket.$write,
                $bucket.enabled,
                $bucket.maximumFileSize,
                $bucket.allowedFileExtensions,
                encryption,
                antivirus
            );
            $bucket.encryption = encryption;
            $bucket.antivirus = antivirus;
            addNotification({
                message: `${$bucket.name} has been updatede`,
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updateMaxSize() {
        try {
            await sdkForProject.storage.updateBucket(
                $bucket.$id,
                $bucket.name,
                $bucket.permission,
                $bucket.$read,
                $bucket.$write,
                $bucket.enabled,
                maxSize
            );
            $bucket.maximumFileSize = maxSize;
            addNotification({
                message: `${$bucket.name} has been updatede`,
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    async function updateAllowedExtensions() {
        try {
            await sdkForProject.storage.updateBucket(
                $bucket.$id,
                $bucket.name,
                $bucket.permission,
                $bucket.$read,
                $bucket.$write,
                $bucket.enabled,
                $bucket.maximumFileSize,
                extensions
            );
            $bucket.allowedFileExtensions = extensions;
            addNotification({
                message: `${$bucket.name} has been updatede`,
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
    {#if $bucket}
        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <h2 class="heading-level-7">{$bucket.name}</h2>
                <div>
                    <p>Created: {toLocaleDate($bucket.dateCreated)}</p>
                    <p>Last Updated: {toLocaleDate($bucket.dateUpdated)}</p>
                </div>
                <div class="u-flex u-main-space-end u-gap-12 common-section">
                    <ul>
                        <InputSwitch
                            label={enabled ? 'Enabled' : 'Disabled'}
                            id="toggle"
                            bind:value={enabled} />
                    </ul>
                </div>
            </div>

            <div class="u-flex u-main-space-end common-section">
                <Button
                    disabled={enabled === $bucket.enabled}
                    on:click={() => {
                        toggleBucket();
                    }}>Update</Button>
            </div>
        </Card>
        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div>
                    <h6 class="heading-level-7">Update Name</h6>
                    <p>Update your bucket name.</p>
                </div>
                <ul>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder={$bucket.name}
                        autocomplete={false}
                        bind:value={bucketName} />
                    {#if showError === 'name'}
                        <Helper type={errorType}>{errorMessage}</Helper>
                    {/if}
                </ul>
            </div>
            <div class="u-flex u-main-space-end common-section">
                <Button
                    disabled={!bucketName}
                    on:click={() => {
                        updateName();
                    }}>Update</Button>
            </div>
        </Card>
        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div>
                    <h6 class="heading-level-7">Update Permissions</h6>
                    <p>
                        Assign read or write permissions at the <b>Bucket Level</b> or
                        <b>File Level</b>. If Bucket Level permissions are assigned, file
                        permissions will be ignored.
                    </p>
                </div>
                <div>
                    <ul class="u-flex u-gap-12 common-section">
                        <li>
                            <label class="label">
                                <input
                                    type="radio"
                                    class="is-small"
                                    name="level"
                                    bind:group={bucketPermissions}
                                    value="bucket" />
                                <span>Bucket Level</span>
                            </label>
                        </li>
                        <li>
                            <label class="label">
                                <input
                                    type="radio"
                                    class="is-small"
                                    name="level"
                                    bind:group={bucketPermissions}
                                    value="file" />
                                <span>File Level</span>
                            </label>
                        </li>
                    </ul>
                    <Alert type="info">
                        <p>
                            Tip: Add <b>role:all</b> for wildcards access. Check out our
                            documentation for more on <a href="/#">Permissions</a>
                        </p>
                    </Alert>
                    {#if bucketPermissions === 'bucket'}
                        <ul class="common-section">
                            <InputTags
                                id="read"
                                label="Read Access"
                                placeholder="User ID, Team ID, or Role"
                                bind:tags={bucketRead} />
                            <InputTags
                                id="write"
                                label="Write Access"
                                placeholder="User ID, Team ID, or Role"
                                bind:tags={bucketWrite} />
                        </ul>
                    {/if}
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
                <div class="">
                    <h2 class="heading-level-7">Update Security Settings</h2>
                    <p>
                        Enable or disable security services for the bucket including <b>
                            Ecryption</b>
                        and <b> Antivirus scanning.</b>
                    </p>
                </div>
                <div class="u-flex u-main-space-end u-gap-12 common-section">
                    <ul>
                        <InputSwitch label="Encryption" id="encryption" bind:value={encryption} />

                        <li>
                            This parameter allows you to configure whether or not the files inside
                            the bucket will be encrypted. We don't encrypt files bigger than 20MB.
                        </li>
                        <InputSwitch label="Antivirus" id="antivirus" bind:value={antivirus} />

                        <li>
                            This parameter allows you to configure whether or not the files inside
                            the bucket should be scanned by the Appwrite Antivirus scanner.
                        </li>
                    </ul>
                </div>
            </div>
            <div class="u-flex u-main-space-end common-section">
                <Button
                    disabled={encryption === $bucket.encryption && antivirus === $bucket.antivirus}
                    on:click={() => {
                        updateSecurity();
                    }}>Update</Button>
            </div></Card>
        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div class="u-flex u-main-space-between u-gap-12 common-section">
                    <div>
                        <h2 class="heading-level-6">Session Length</h2>
                        <p>
                            If you reduce the limit, users who are currently logged in will be
                            logged out of the application.
                        </p>
                    </div>
                </div>
                <ul class="u-flex u-gap-12">
                    <InputNumber
                        id="size"
                        label="Size"
                        placeholder={$bucket.maximumFileSize + ''}
                        bind:value={maxSize} />
                    <InputSelect id="bytes" label="Bytes" {options} value={options[0].value} />
                </ul>
            </div>
            <div class="u-flex u-main-space-end common-section">
                <Button
                    disabled={!maxSize}
                    on:click={() => {
                        updateMaxSize();
                    }}>Update</Button>
            </div>
        </Card>
        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div>
                    <h6 class="heading-level-7">Update Allowed File Extensions</h6>
                    <p>
                        A maxiumum of 100 file extensions can be added. Leave blank to allow all
                        file types.
                    </p>
                </div>
                <div>
                    <Alert type="info">
                        <p>
                            Tip: Commonly added extensions include JPG, PNG, SVG, GIF, HTML, PDF,
                            MP4.
                        </p>
                    </Alert>
                    <ul class="common-section">
                        <InputTags
                            id="read"
                            label="Allowed file extensions"
                            placeholder="JPG, PNG, SVG, GIF, HTML, PDF, MP4"
                            bind:tags={extensions} />
                    </ul>
                </div>
            </div>
            <div class="u-flex u-main-space-end common-section">
                <Button
                    disabled={isExtensionsDisabled}
                    on:click={() => {
                        updateAllowedExtensions();
                    }}>Update</Button>
            </div>
        </Card>
        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div>
                    <h6 class="heading-level-7">Danger Zone</h6>
                    <p>
                        The user will be permanently deleted, including all data associated with
                        this user. This action is irreversible.
                    </p>
                </div>
                <div>
                    <div class="user-profile-button">
                        <span class="user-profile-info">
                            <h6 class="heading-level-7">{$bucket.name}</h6>
                            <p>Last Updated: {toLocaleDate($bucket.dateUpdated)}</p>
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
