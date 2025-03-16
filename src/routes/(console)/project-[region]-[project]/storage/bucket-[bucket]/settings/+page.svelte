<script lang="ts" context="module">
    import { page } from '$app/stores';
    import { get, writable } from 'svelte/store';
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
        const $page = get(page);
        const values = { ...bucketData, ...updates };

        if (!isValueOfStringEnum(Compression, values.compression)) {
            throw new Error(`Invalid compression: ${values.compression}`);
        }

        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .storage.updateBucket(
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

            await invalidate(Dependencies.BUCKET);

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
    import { BoxAvatar, CardGrid, Heading } from '$lib/components';
    import { Permissions } from '$lib/components/permissions';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import {
        Button,
        Form,
        FormItem,
        FormList,
        InputChoice,
        InputSelect,
        InputSwitch,
        InputTags,
        InputText
    } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Compression, type Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import Delete from '../deleteBucket.svelte';
    import { bucket } from '../store';
    import UpdateMaxFileSize from './updateMaxFileSize.svelte';
    import { readOnly } from '$lib/stores/billing';
    import { GRACE_PERIOD_OVERRIDE } from '$lib/system';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import type { PageData } from './$types';

    export let data: PageData;

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
        <Form onSubmit={toggleBucket}>
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
                        <p class="text">Last updated: {toLocaleDateTime($bucket.$updatedAt)}</p>
                    </div>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        disabled={enabled === $bucket.enabled ||
                            ($readOnly && !GRACE_PERIOD_OVERRIDE)}
                        submit>
                        Update
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form onSubmit={updateName}>
            <CardGrid>
                <Heading tag="h6" size="7">Name</Heading>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputText
                            id="name"
                            label="Name"
                            placeholder="Enter name"
                            readonly={$readOnly && !GRACE_PERIOD_OVERRIDE}
                            bind:value={bucketName} />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        disabled={bucketName === $bucket.name ||
                            !bucketName ||
                            ($readOnly && !GRACE_PERIOD_OVERRIDE)}
                        submit>
                        Update
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form onSubmit={updatePermissions}>
            <CardGrid hideOverflow>
                <Heading tag="h6" size="7" id="permissions">Permissions</Heading>
                <p class="text">
                    Choose who can access your buckets and files. For more information, visit our <a
                        href="https://appwrite.io/docs/advanced/platform/permissions"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link">
                        Permissions guide
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

        <Form onSubmit={updateFileSecurity}>
            <CardGrid>
                <Heading tag="h6" size="7" id="file-security">File security</Heading>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputSwitch
                            bind:value={bucketFileSecurity}
                            id="security"
                            label="File security" />
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
                    <Button
                        disabled={bucketFileSecurity === $bucket.fileSecurity ||
                            ($readOnly && !GRACE_PERIOD_OVERRIDE)}
                        submit>
                        Update
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form onSubmit={updateSecurity}>
            <CardGrid>
                <Heading tag="h2" size="7">Security settings</Heading>
                <p class="text">
                    Enable or disable security services for the bucket including <b>Ecryption</b>
                    and <b>Antivirus scanning.</b>
                </p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <FormItem>
                            <InputChoice
                                label="Encryption"
                                id="encryption"
                                type="switchbox"
                                bind:value={encryption}>
                                This parameter allows you to configure whether or not the files
                                inside the bucket will be encrypted. We don't encrypt files bigger
                                than 20MB.
                            </InputChoice>
                        </FormItem>

                        <FormItem>
                            <InputChoice
                                label="Antivirus"
                                id="antivirus"
                                type="switchbox"
                                bind:value={antivirus}>
                                This parameter allows you to configure whether or not the files
                                inside the bucket should be scanned by the Appwrite Antivirus
                                scanner.
                            </InputChoice>
                        </FormItem>
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

        <Form onSubmit={updateCompression}>
            <CardGrid>
                <Heading tag="h2" size="6">Compression</Heading>
                <p class="text">
                    Choose an algorithm for compression. For files larger than 20MB, compression
                    will be skipped even if it's enabled.
                </p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputSelect
                            id="compression"
                            label="Algorithm"
                            options={compressionOptions}
                            bind:value={compression} />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={compression === $bucket.compression} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <UpdateMaxFileSize currentPlan={data.currentPlan} />

        <Form onSubmit={updateAllowedExtensions}>
            <CardGrid hideOverflow>
                <Heading tag="h6" size="7" id="extensions">Allowed file extensions</Heading>
                <p class="text">
                    Allowed file extensions. A maximum of 100 file extensions can be added. Leave
                    blank to allow all file types.
                </p>
                <svelte:fragment slot="aside">
                    <ul class="common-section">
                        <InputTags
                            id="read"
                            label="Allowed extensions"
                            placeholder="Allowed file extensions (mp4, jpg, pdf, etc.)"
                            bind:tags={extensions} />
                        <li class="u-flex u-gap-12 u-margin-block-start-8 with-scroll">
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
                    <Button
                        disabled={isExtensionsDisabled || ($readOnly && !GRACE_PERIOD_OVERRIDE)}
                        submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid danger>
            <Heading tag="h6" size="7">Delete bucket</Heading>
            <p class="text">
                The bucket will be permanently deleted, including all the files within it. This
                action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <BoxAvatar>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$bucket.name}</h6>
                    </svelte:fragment>
                    <p class="text">Last updated: {toLocaleDateTime($bucket.$updatedAt)}</p>
                </BoxAvatar>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
