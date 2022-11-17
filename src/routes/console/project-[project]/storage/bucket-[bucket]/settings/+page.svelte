<script lang="ts">
    import { Pill } from '$lib/elements';
    import { CardGrid, Box, Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import {
        Form,
        Button,
        InputText,
        InputTags,
        InputNumber,
        InputSelect,
        InputSwitch,
        FormList
    } from '$lib/elements/forms';
    import { bucket } from '../store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { sizeToBytes } from '$lib/helpers/sizeConvertion';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { onMount } from 'svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Permissions } from '$lib/components/permissions';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Delete from '../deleteBucket.svelte';
    import { trackEvent } from '$lib/actions/analytics';

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
        enabled ??= $bucket.enabled;
        bucketName ??= $bucket.name;
        bucketName ??= $bucket.name;
        bucketFileSecurity ??= $bucket.fileSecurity;
        bucketPermissions ??= $bucket.$permissions;
        encryption ??= $bucket.encryption;
        antivirus ??= $bucket.antivirus;
    });
    $: if (bucketPermissions) {
        if (symmetricDifference(bucketPermissions, $bucket.$permissions).length) {
            arePermsDisabled = false;
        } else arePermsDisabled = true;
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
            invalidate(Dependencies.BUCKET);
            addNotification({
                message: `${$bucket.name} has been updated`,
                type: 'success'
            });
            trackEvent('submit_bucket_enable', {
                value: enabled
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
            invalidate(Dependencies.BUCKET);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent('submit_bucket_update_name');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updatePermissions() {
        try {
            await sdkForProject.storage.updateBucket($bucket.$id, $bucket.name, bucketPermissions);
            invalidate(Dependencies.BUCKET);
            arePermsDisabled = true;
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent('submit_bucket_update_permissions');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updateFileSecurity() {
        try {
            await sdkForProject.storage.updateBucket(
                $bucket.$id,
                $bucket.name,
                $bucket.$permissions,
                bucketFileSecurity
            );
            invalidate(Dependencies.BUCKET);
            arePermsDisabled = true;
            addNotification({
                message: 'Security has been updated',
                type: 'success'
            });
            trackEvent('submit_bucket_update_file_security');
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
            invalidate(Dependencies.BUCKET);
            addNotification({
                message: `${$bucket.name} has been updated`,
                type: 'success'
            });
            trackEvent('submit_bucket_update_security');
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
            invalidate(Dependencies.BUCKET);
            addNotification({
                message: `${$bucket.name} has been updated`,
                type: 'success'
            });
            trackEvent('submit_bucket_update_size');
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
            invalidate(Dependencies.BUCKET);
            addNotification({
                message: `${$bucket.name} has been updated`,
                type: 'success'
            });
            trackEvent('submit_bucket_update_extensions');
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
                <Heading tag="h2" size="7">{$bucket.name}</Heading>

                <svelte:fragment slot="aside">
                    <div>
                        <FormList>
                            <InputSwitch
                                label={enabled ? 'Enabled' : 'Disabled'}
                                id="toggle"
                                bind:value={enabled} />
                        </FormList>
                        <p>Created: {toLocaleDateTime($bucket.$createdAt)}</p>
                        <p>Last Updated: {toLocaleDateTime($bucket.$updatedAt)}</p>
                    </div>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={enabled === $bucket.enabled} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={updateName}>
            <CardGrid>
                <Heading tag="h6" size="7">Update Name</Heading>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputText
                            id="name"
                            label="Name"
                            placeholder="Enter name"
                            autocomplete={false}
                            bind:value={bucketName} />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={bucketName === $bucket.name || !bucketName} submit>
                        Update
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={updatePermissions}>
            <CardGrid>
                <Heading tag="h6" size="7">Update Permissions</Heading>
                <p class="text">
                    Choose who can access your buckets and files. For more information, check out
                    the <a
                        href="https://appwrite.io/docs/permissions"
                        target="_blank"
                        rel="noopener noreferrer">Permissions Guide</a> in our documentation.
                </p>
                <svelte:fragment slot="aside">
                    {#if bucketPermissions}
                        <Permissions bind:permissions={bucketPermissions} withCreate />
                    {/if}
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button disabled={arePermsDisabled} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={updateFileSecurity}>
            <CardGrid>
                <Heading tag="h6" size="7">Update File Security</Heading>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputSwitch
                            bind:value={bucketFileSecurity}
                            id="security"
                            label="File Security" />
                    </FormList>
                    <p class="text">
                        When file security is enabled, users will be able to access files for which
                        they have been granted <b>either File or Bucket permissions</b>.
                    </p>
                    <p class="text">
                        If file security is disabled, users can access files <b
                            >only if they have Bucket permissions</b
                        >. File permissions will be ignored..
                    </p>
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button disabled={bucketFileSecurity === $bucket.fileSecurity} submit>
                        Update
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={updateSecurity}>
            <CardGrid>
                <Heading tag="h2" size="7">Update Security Settings</Heading>
                <p>
                    Enable or disable security services for the bucket including <b>Ecryption</b>
                    and <b>Antivirus scanning.</b>
                </p>
                <svelte:fragment slot="aside">
                    <FormList>
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
                    </FormList>
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
                <Heading tag="h2" size="6">Update Maximum File Size</Heading>
                <p>Set the maximum file size allowed in the bucket.</p>
                <svelte:fragment slot="aside">
                    <ul class="u-flex u-gap-12">
                        <InputNumber
                            id="size"
                            label="Size"
                            placeholder="256"
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
                <Heading tag="h6" size="7">Update Allowed File Extensions</Heading>
                <p>
                    A maximum of 100 file extensions can be added. Leave blank to allow all file
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
                                        if (!extensions.includes(ext)) {
                                            extensions = [...extensions, ext];
                                        } else {
                                            extensions = extensions.filter((e) => e !== ext);
                                        }
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

        <CardGrid danger>
            <Heading tag="h6" size="7">Delete Bucket</Heading>
            <p>
                The bucket will be permanently deleted, including all the files within it. This
                action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$bucket.name}</h6>
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
