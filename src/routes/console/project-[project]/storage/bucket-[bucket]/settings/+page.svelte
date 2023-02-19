<script lang="ts" context="module">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

    type TUpdateBucketMisc = {
        successMessage?: string;
        trackEventName: Submit;
        trackEventData?: { value: boolean };
        arePermsDisabled?: boolean;
    };

    let arePermsDisabled = writable(true);

    export async function updateBucket(updates: Partial<Models.Bucket>, misc: TUpdateBucketMisc) {
        const bucketData = get(bucket);
        const values = { ...bucketData, ...updates };

        try {
            await sdkForProject.storage.updateBucket(
                values.$id,
                values.name,
                values.$permissions,
                values.fileSecurity,
                values.enabled,
                values.maximumFileSize,
                values.allowedFileExtensions,
                values.compression,
                values.encryption,
                values.antivirus
            );

            invalidate(Dependencies.BUCKET);

            if (misc.arePermsDisabled !== undefined) {
                arePermsDisabled.set(misc.arePermsDisabled);
            }

            addNotification({
                message: misc.successMessage ?? `${bucketData.name} has been updated`,
                type: 'success'
            });

            if (misc.trackEventName) {
                trackEvent(misc.trackEventName, misc.trackEventData);
            }
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, misc.trackEventName);
        }
    }
</script>

<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Box, CardGrid, Heading } from '$lib/components';
    import { Permissions } from '$lib/components/permissions';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import {
        Button,
        Form,
        FormList,
        InputSelect,
        InputSwitch,
        InputTags,
        InputText
    } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { onMount } from 'svelte';
    import { get, writable } from 'svelte/store';
    import Delete from '../deleteBucket.svelte';
    import { bucket } from '../store';
    import UpdateMaxFileSize from './updateMaxFileSize.svelte';

    let showDelete = false;

    let enabled: boolean = null;
    let bucketName: string = null;
    let bucketFileSecurity: boolean = null;
    let bucketPermissions: string[] = null;
    let encryption: boolean = null;
    let antivirus: boolean = null;
    let compression: string = null;

    const compressionOptions = [
        { label: 'None', value: 'none' },
        { label: 'Gzip', value: 'gzip' },
        { label: 'Zstd', value: 'zstd' }
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

        compression ??= $bucket.compression;
    });

    $: if (bucketPermissions) {
        if (symmetricDifference(bucketPermissions, $bucket.$permissions).length) {
            $arePermsDisabled = false;
        } else $arePermsDisabled = true;
    }

    $: if (extensions) {
        if (JSON.stringify(extensions) !== JSON.stringify($bucket.allowedFileExtensions)) {
            isExtensionsDisabled = false;
        } else isExtensionsDisabled = true;
    }

    function toggleBucket() {
        updateBucket(
            {
                enabled
            },
            {
                trackEventName: Submit.BucketUpdateEnabled,
                trackEventData: {
                    value: enabled
                }
            }
        );
    }

    function updateName() {
        updateBucket(
            {
                name: bucketName
            },
            {
                successMessage: 'Name has been updated',
                trackEventName: Submit.BucketUpdateName
            }
        );
    }

    function updatePermissions() {
        updateBucket(
            {
                $permissions: bucketPermissions
            },
            {
                successMessage: 'Permissions have been updated',
                trackEventName: Submit.BucketUpdatePermissions,
                arePermsDisabled: true
            }
        );
    }

    function updateFileSecurity() {
        updateBucket(
            {
                fileSecurity: bucketFileSecurity
            },
            {
                successMessage: 'Security has been updated',
                trackEventName: Submit.BucketUpdateFileSecurity,
                arePermsDisabled: true
            }
        );
    }

    function updateSecurity() {
        updateBucket(
            {
                encryption,
                antivirus
            },
            {
                trackEventName: Submit.BucketUpdateSecurity
            }
        );
    }

    function updateCompression() {
        updateBucket(
            {
                compression
            },
            {
                trackEventName: Submit.BucketUpdateCompression
            }
        );
    }

    function updateAllowedExtensions() {
        updateBucket(
            {
                allowedFileExtensions: extensions
            },
            {
                trackEventName: Submit.BucketUpdateExtensions
            }
        );
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
                        <p class="text">Created: {toLocaleDateTime($bucket.$createdAt)}</p>
                        <p class="text">Last Updated: {toLocaleDateTime($bucket.$updatedAt)}</p>
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
                        rel="noopener noreferrer"
                        class="link">
                        Permissions Guide
                    </a>.
                </p>
                <svelte:fragment slot="aside">
                    {#if bucketPermissions}
                        <Permissions bind:permissions={bucketPermissions} withCreate />
                    {/if}
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button disabled={$arePermsDisabled} submit>Update</Button>
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
                <p class="text">
                    Enable or disable security services for the bucket including <b>Ecryption</b>
                    and <b>Antivirus scanning.</b>
                </p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <li class="form-item">
                            <label class="choice-item" for="encryption">
                                <div class="input-text-wrapper">
                                    <input
                                        name="encryption"
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
                                        name="antivirus"
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
                        submit>
                        Update
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={updateCompression}>
            <CardGrid>
                <Heading tag="h2" size="6">Update Compression Algorithm</Heading>
                <p class="text">
                    Choose an algorithm for compression. For files larger than 20MB, compression
                    will be skipped even if it's enabled.
                </p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputSelect
                            id="compression"
                            label="Compression algorithm"
                            options={compressionOptions}
                            bind:value={compression} />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={compression === $bucket.compression} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <UpdateMaxFileSize />

        <Form on:submit={updateAllowedExtensions}>
            <CardGrid>
                <Heading tag="h6" size="7">Update Allowed File Extensions</Heading>
                <p class="text">
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
            <p class="text">
                The bucket will be permanently deleted, including all the files within it. This
                action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$bucket.name}</h6>
                    </svelte:fragment>
                    <p class="text">Last Updated: {toLocaleDateTime($bucket.$updatedAt)}</p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
