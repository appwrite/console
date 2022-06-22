<script lang="ts">
    import { Alert, CardGrid, Box } from '$lib/components';
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
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import Delete from './_deleteBucket.svelte';

    let showDelete = false;
    let showError: false | 'name' | 'size' = false;
    let errorMessage = 'Something went wrong';
    let errorType: 'error' | 'warning' | 'success' = 'error';
    let enabled = $bucket.response.enabled;
    let bucketName = '';
    let bucketPermissions = $bucket.response.permission;
    let bucketRead = $bucket.response.$read;
    let bucketWrite = $bucket.response.$write;
    let arePermsDisabled = true;
    let encryption = $bucket.response.encryption;
    let antivirus = $bucket.response.antivirus;
    let maxSize: number;
    let options = [
        { label: 'Bytes', value: 'b' },
        { label: 'Kilobytes', value: 'kb' },
        { label: 'Megabytes', value: 'mb' },
        { label: 'Gigabytes', value: 'gb' }
    ];
    let extensions = $bucket.response.allowedFileExtensions;
    let isExtensionsDisabled = true;

    $: if (bucketPermissions || bucketRead || bucketWrite) {
        if (bucketPermissions !== $bucket.response.permission) {
            arePermsDisabled = false;
        } else if (bucketRead) {
            if (JSON.stringify(bucketRead) !== JSON.stringify($bucket.response.$read)) {
                arePermsDisabled = false;
            } else arePermsDisabled = true;
        } else if (bucketWrite) {
            if (JSON.stringify(bucketWrite) !== JSON.stringify($bucket.response.$write)) {
                arePermsDisabled = false;
            } else arePermsDisabled = true;
        }
    }
    $: if (extensions) {
        if (JSON.stringify(extensions) !== JSON.stringify($bucket.response.allowedFileExtensions)) {
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
                $bucket.response.$id,
                $bucket.response.name,
                $bucket.response.permission,
                $bucket.response.$read,
                $bucket.response.$write,
                enabled
            );
            $bucket.response.enabled = enabled;
            addNotification({
                message: `${$bucket.response.name} has been updatede`,
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
            await sdkForProject.storage.updateBucket(
                $bucket.response.$id,
                $bucket.response.name,
                $bucket.response.permission
            );
            $bucket.response.name = bucketName;
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
                $bucket.response.$id,
                $bucket.response.name,
                bucketPermissions,
                bucketPermissions === 'bucket' ? bucketRead : $bucket.response.$read,
                bucketPermissions === 'bucket' ? bucketWrite : $bucket.response.$write
            );
            $bucket.response.permission = bucketPermissions;
            $bucket.response.$read = bucketRead;
            $bucket.response.$write = bucketWrite;
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
                $bucket.response.$id,
                $bucket.response.name,
                $bucket.response.permission,
                $bucket.response.$read,
                $bucket.response.$write,
                $bucket.response.enabled,
                $bucket.response.maximumFileSize,
                $bucket.response.allowedFileExtensions,
                encryption,
                antivirus
            );
            $bucket.response.encryption = encryption;
            $bucket.response.antivirus = antivirus;
            addNotification({
                message: `${$bucket.response.name} has been updatede`,
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
                $bucket.response.$id,
                $bucket.response.name,
                $bucket.response.permission,
                $bucket.response.$read,
                $bucket.response.$write,
                $bucket.response.enabled,
                maxSize
            );
            $bucket.response.maximumFileSize = maxSize;
            addNotification({
                message: `${$bucket.response.name} has been updatede`,
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
                $bucket.response.$id,
                $bucket.response.name,
                $bucket.response.permission,
                $bucket.response.$read,
                $bucket.response.$write,
                $bucket.response.enabled,
                $bucket.response.maximumFileSize,
                extensions
            );
            $bucket.response.allowedFileExtensions = extensions;
            addNotification({
                message: `${$bucket.response.name} has been updatede`,
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
    {#if $bucket.response}
        <CardGrid>
            <h2 class="heading-level-7">{$bucket.response.name}</h2>

            <svelte:fragment slot="right">
                <ul>
                    <InputSwitch
                        label={enabled ? 'Enabled' : 'Disabled'}
                        id="toggle"
                        bind:value={enabled} />
                </ul>
                <p>Created: {toLocaleDateTime($bucket.response.dateCreated)}</p>
                <p>Last Updated: {toLocaleDateTime($bucket.response.dateUpdated)}</p>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={enabled === $bucket.response.enabled}
                    on:click={() => {
                        toggleBucket();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <h6 class="heading-level-7">Update Name</h6>

            <svelte:fragment slot="right">
                <ul>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder={$bucket.response.name}
                        autocomplete={false}
                        bind:value={bucketName} />
                    {#if showError === 'name'}
                        <Helper type={errorType}>{errorMessage}</Helper>
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={!bucketName}
                    on:click={() => {
                        updateName();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <h6 class="heading-level-7">Update Permissions</h6>
            <p>
                Assign read or write permissions at the <b>Bucket Level</b> or
                <b>File Level</b>. If Bucket Level permissions are assigned, file permissions will
                be ignored.
            </p>
            <svelte:fragment slot="right">
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
                        Tip: Add <b>role:all</b> for wildcards access. Check out our documentation
                        for more on <a href="/#">Permissions</a>
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
            <h2 class="heading-level-7">Update Security Settings</h2>
            <p>
                Enable or disable security services for the bucket including <b> Ecryption</b>
                and <b> Antivirus scanning.</b>
            </p>
            <svelte:fragment slot="right">
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
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={encryption === $bucket.response.encryption &&
                        antivirus === $bucket.response.antivirus}
                    on:click={() => {
                        updateSecurity();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <h2 class="heading-level-6">Session Length</h2>
            <p>
                If you reduce the limit, users who are currently logged in will be logged out of the
                application.
            </p>
            <svelte:fragment slot="right">
                <ul class="u-flex u-gap-12">
                    <InputNumber
                        id="size"
                        label="Size"
                        placeholder={$bucket.response.maximumFileSize + ''}
                        bind:value={maxSize} />
                    <InputSelect id="bytes" label="Bytes" {options} value={options[0].value} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={!maxSize}
                    on:click={() => {
                        updateMaxSize();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <h6 class="heading-level-7">Update Allowed File Extensions</h6>
            <p>
                A maxiumum of 100 file extensions can be added. Leave blank to allow all file types.
            </p>
            <svelte:fragment slot="right">
                <Alert type="info">
                    <p>
                        Tip: Commonly added extensions include JPG, PNG, SVG, GIF, HTML, PDF, MP4.
                    </p>
                </Alert>
                <ul class="common-section">
                    <InputTags
                        id="read"
                        label="Allowed file extensions"
                        placeholder="Allowed file extensions (mp4, jpg, pdf, etc.)"
                        bind:tags={extensions} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={isExtensionsDisabled}
                    on:click={() => {
                        updateAllowedExtensions();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <h6 class="heading-level-7">Delete Bucket</h6>
            <p>
                The bucket will be permanently deleted, including all the files within it. This
                action is irreversible.
            </p>
            <svelte:fragment slot="right">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold">{$bucket.response.name}</h6>
                    </svelte:fragment>
                    <p>Last Updated: {toLocaleDateTime($bucket.response.dateUpdated)}</p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
