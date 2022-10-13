<script lang="ts">
    import { CardGrid, Box } from '$lib/components';
    import { Container } from '$lib/layout';
    import {
        Form,
        Button,
        InputText,
        InputTags,
        InputNumber,
        InputSelect,
        InputSwitch
    } from '$lib/elements/forms';
    import { bucket } from '../store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { sizeToBytes, bytesToSize } from '$lib/helpers/sizeConvertion';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import Delete from '../_deleteBucket.svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import Pill from '$lib/elements/pill.svelte';
    import { difference } from '$lib/helpers/array';
    import { Permissions } from '$lib/components/permissions';

    let showDelete = false;

    let enabled: boolean = null,
        bucketName: string = null,
        bucketFileSecurity: boolean = null,
        bucketPermissions: string[] = null,
        arePermsDisabled = true,
        encryption: boolean = null,
        antivirus: boolean = null,
        maxSize: number;
    let byteUnit: 'Bytes' | 'KB' | 'MB' | 'GB' = 'MB',
        options = [
            { label: 'Bytes', value: 'Bytes' },
            { label: 'Kilobytes', value: 'KB' },
            { label: 'Megabytes', value: 'MB' },
            { label: 'Gigabytes', value: 'GB' }
        ];
    let suggestedExtensions = ['jpg', 'png', 'svg', 'gif', 'html', 'pdf', 'mp4'];
    let extensions = $bucket.allowedFileExtensions;
    let isExtensionsDisabled = true;

    onMount(async () => {
        await bucket.load($page.params.bucket);
        enabled ??= $bucket.enabled;
        bucketName ??= $bucket.name;
        bucketName ??= $bucket.name;
        bucketFileSecurity ??= $bucket.fileSecurity;
        bucketPermissions ??= $bucket.$permissions;
        encryption ??= $bucket.encryption;
        antivirus ??= $bucket.antivirus;
    });
    $: maxSizePlaceholder = bytesToSize($bucket.maximumFileSize, byteUnit);
    $: if (bucketFileSecurity || bucketPermissions) {
        if (bucketFileSecurity !== $bucket.fileSecurity) {
            arePermsDisabled = false;
        } else if (bucketPermissions) {
            if (difference(bucketPermissions, $bucket.$permissions).length) {
                arePermsDisabled = false;
            } else arePermsDisabled = true;
        }
    }
    $: if (extensions) {
        if (JSON.stringify(extensions) !== JSON.stringify($bucket.allowedFileExtensions)) {
            isExtensionsDisabled = false;
        } else isExtensionsDisabled = true;
    }

    async function toggleBucket() {
        try {
            await sdkForProject.storage.updateBucket(
                $bucket.$id,
                $bucket.name,
                undefined,
                undefined,
                enabled
            );
            $bucket.enabled = enabled;
            addNotification({
                message: `${$bucket.name} has been updated`,
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
            await sdkForProject.storage.updateBucket($bucket.$id, bucketName);
            $bucket.name = bucketName;
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updatePermissions() {
        try {
            await sdkForProject.storage.updateBucket(
                $bucket.$id,
                $bucket.name,
                bucketFileSecurity ? bucketPermissions : undefined,
                bucketFileSecurity
            );
            $bucket.fileSecurity = bucketFileSecurity;
            $bucket.$permissions = bucketPermissions;
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
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                encryption,
                antivirus
            );
            $bucket.encryption = encryption;
            $bucket.antivirus = antivirus;
            addNotification({
                message: `${$bucket.name} has been updated`,
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
        let size = sizeToBytes(maxSize, byteUnit);
        try {
            await sdkForProject.storage.updateBucket(
                $bucket.$id,
                $bucket.name,
                undefined,
                undefined,
                undefined,
                size
            );
            $bucket.maximumFileSize = maxSize;
            addNotification({
                message: `${$bucket.name} has been updated`,
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
                undefined,
                undefined,
                undefined,
                undefined,
                extensions
            );
            $bucket.allowedFileExtensions = extensions;
            addNotification({
                message: `${$bucket.name} has been updated`,
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
        <Form on:submit={toggleBucket}>
            <CardGrid>
                <h2 class="heading-level-7">{$bucket.name}</h2>

                <svelte:fragment slot="aside">
                    <ul>
                        <InputSwitch
                            label={enabled ? 'Enabled' : 'Disabled'}
                            id="toggle"
                            bind:value={enabled} />
                    </ul>
                    <p>Created: {toLocaleDateTime($bucket.$createdAt)}</p>
                    <p>Last Updated: {toLocaleDateTime($bucket.$updatedAt)}</p>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={enabled === $bucket.enabled} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={updateName}>
            <CardGrid>
                <h6 class="heading-level-7">Update Name</h6>
                <svelte:fragment slot="aside">
                    <ul>
                        <InputText
                            id="name"
                            label="Name"
                            placeholder="Enter name"
                            autocomplete={false}
                            bind:value={bucketName} />
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={bucketName === $bucket.name || !bucketName} submit
                        >Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={updatePermissions}>
            <CardGrid>
                <h6 class="heading-level-7">Update Permissions</h6>
                <p>
                    Assign read or write permissions at the <b>Bucket Level</b> or
                    <b>File Level</b>. If Bucket Level permissions are assigned, file permissions
                    will be ignored.
                </p>
                <svelte:fragment slot="aside">
                    <ul class="checkboxes-list">
                        <li class="checkboxes-item">
                            <label class="label">
                                <input
                                    type="radio"
                                    class="is-small"
                                    name="level"
                                    bind:group={bucketFileSecurity}
                                    value={true} />
                                <span>Bucket Level</span>
                            </label>
                        </li>
                        <li class="checkboxes-item">
                            <label class="label">
                                <input
                                    type="radio"
                                    class="is-small"
                                    name="level"
                                    bind:group={bucketFileSecurity}
                                    value={false} />
                                <span>File Level</span>
                            </label>
                        </li>
                    </ul>
                    {#if bucketFileSecurity}
                        <Permissions bind:permissions={bucketPermissions} />
                    {/if}
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button disabled={arePermsDisabled} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={updateSecurity}>
            <CardGrid>
                <h2 class="heading-level-7">Update Security Settings</h2>
                <p>
                    Enable or disable security services for the bucket including <b>Ecryption</b>
                    and <b>Antivirus scanning.</b>
                </p>
                <svelte:fragment slot="aside">
                    <ul class="form-list">
                        <li class="form-item">
                            <label class="choice-item" for="encryption">
                                <div class="input-text-wrapper">
                                    <input
                                        label="Encryption"
                                        id="encryption"
                                        type="checkbox"
                                        class="switch"
                                        role="switch"
                                        aria-checked={encryption}
                                        bind:checked={encryption} />
                                </div>
                                <div class="choice-item-content">
                                    <div class="choice-item-title">Encryption</div>

                                    <div class="choice-item-paragraph">
                                        This parameter allows you to configure whether or not the
                                        files inside the bucket will be encrypted. We don't encrypt
                                        files bigger than 20MB.
                                    </div>
                                </div>
                            </label>
                        </li>
                        <li class="form-item">
                            <label class="choice-item" for="antivirus">
                                <div class="input-text-wrapper">
                                    <input
                                        label="Antivirus"
                                        id="antivirus"
                                        type="checkbox"
                                        class="switch"
                                        role="switch"
                                        aria-checked={antivirus}
                                        bind:checked={antivirus} />
                                </div>
                                <div class="choice-item-content">
                                    <div class="choice-item-title">Antivirus</div>

                                    <div class="choice-item-paragraph">
                                        This parameter allows you to configure whether or not the
                                        files inside the bucket should be scanned by the Appwrite
                                        Antivirus scanner.
                                    </div>
                                </div>
                            </label>
                        </li>

                        <li />
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        disabled={encryption === $bucket.encryption &&
                            antivirus === $bucket.antivirus}
                        submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={updateMaxSize}>
            <CardGrid>
                <h2 class="heading-level-6">Update Maximum File Size</h2>
                <p>Set the maximum file size allowed in the bucket.</p>
                <svelte:fragment slot="aside">
                    <ul class="u-flex u-gap-12">
                        <InputNumber
                            id="size"
                            label="Size"
                            placeholder={`${maxSizePlaceholder}`}
                            bind:value={maxSize} />
                        <InputSelect id="bytes" label="Bytes" {options} bind:value={byteUnit} />
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={!maxSize} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={updateAllowedExtensions}>
            <CardGrid>
                <h6 class="heading-level-7">Update Allowed File Extensions</h6>
                <p>
                    A maxiumum of 100 file extensions can be added. Leave blank to allow all file
                    types.
                </p>
                <svelte:fragment slot="aside">
                    <ul class="common-section">
                        <InputTags
                            id="read"
                            label="Allowed file extensions"
                            placeholder="Allowed file extensions (mp4, jpg, pdf, etc.)"
                            bind:tags={extensions} />
                        <li class="u-flex u-gap-12 u-margin-block-start-8 ">
                            {#each suggestedExtensions as ext}
                                <Pill
                                    selected={extensions.includes(ext)}
                                    button
                                    on:click={() => {
                                        if (!extensions.includes(ext))
                                            extensions = [...extensions, ext];
                                    }}>
                                    <span class="icon-plus" aria-hidden="true" />
                                    {ext}
                                </Pill>
                            {/each}
                        </li>
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={isExtensionsDisabled} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid>
            <h6 class="heading-level-7">Delete Bucket</h6>
            <p>
                The bucket will be permanently deleted, including all the files within it. This
                action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold">{$bucket.name}</h6>
                    </svelte:fragment>
                    <p>Last Updated: {toLocaleDateTime($bucket.$updatedAt)}</p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
