<script lang="ts" context="module">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

    type TUpdateBucketMisc = {
        successMessage?: string;
        trackEventName: Submit;
        trackEventData?: { value: boolean };
        arePermsDisabled?: boolean;
    };

    let arePermsDisabled = writable(true);

    export async function updateBucket(
        bucket: Models.Bucket,
        updates: Partial<Models.Bucket>,
        misc: TUpdateBucketMisc
    ) {
        const values = { ...bucket, ...updates };

        if (!isValueOfStringEnum(Compression, values.compression)) {
            throw new Error(`Invalid compression: ${values.compression}`);
        }

        try {
            await sdk.forProject.storage.updateBucket(
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
                message: misc.successMessage ?? `${bucket.name} has been updated`,
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
    import { BoxAvatar, CardGrid } from '$lib/components';
    import { Permissions } from '$lib/components/permissions';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import {
        Button,
        Form,
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
    import { writable } from 'svelte/store';
    import Delete from '../deleteBucket.svelte';
    import UpdateMaxFileSize from './updateMaxFileSize.svelte';
    import { readOnly } from '$lib/stores/billing';
    import { GRACE_PERIOD_OVERRIDE } from '$lib/system';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import type { PageData } from './$types';
    import { Icon, Layout, Link, Selector, Tag, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Click } from '$lib/actions/analytics';

    export let data: PageData;

    let showDelete = false;

    let {
        enabled,
        name,
        fileSecurity,
        $permissions: permissions,
        encryption,
        antivirus,
        compression
    } = data.bucket;

    const compressionOptions = [
        { label: 'None', value: 'none' },
        { label: 'Gzip', value: 'gzip' },
        { label: 'Zstd', value: 'zstd' }
    ];
    let suggestedExtensions = ['jpg', 'png', 'svg', 'gif', 'html', 'pdf', 'mp4'];
    let extensions = data.bucket.allowedFileExtensions;
    let isExtensionsDisabled = true;

    $: if (permissions) {
        $arePermsDisabled = !symmetricDifference(permissions, data.bucket.$permissions).length;
    }

    $: if (extensions) {
        isExtensionsDisabled =
            JSON.stringify(extensions) === JSON.stringify(data.bucket.allowedFileExtensions);
    }

    function toggleBucket() {
        updateBucket(
            data.bucket,
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
            data.bucket,
            {
                name
            },
            {
                successMessage: 'Name has been updated',
                trackEventName: Submit.BucketUpdateName
            }
        );
    }

    function updatePermissions() {
        updateBucket(
            data.bucket,
            {
                $permissions: permissions
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
            data.bucket,
            {
                fileSecurity
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
            data.bucket,
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
            data.bucket,
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
            data.bucket,
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
    <Form onSubmit={toggleBucket}>
        <CardGrid>
            <svelte:fragment slot="title">{data.bucket.name}</svelte:fragment>
            <svelte:fragment slot="aside">
                <div>
                    <InputSwitch
                        label={enabled ? 'Enabled' : 'Disabled'}
                        id="toggle"
                        bind:value={enabled} />
                    <p class="text">Created: {toLocaleDateTime(data.bucket.$createdAt)}</p>
                    <p class="text">Last updated: {toLocaleDateTime(data.bucket.$updatedAt)}</p>
                </div>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={enabled === data.bucket.enabled ||
                        ($readOnly && !GRACE_PERIOD_OVERRIDE)}
                    submit>
                    Update
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form onSubmit={updateName}>
        <CardGrid>
            <svelte:fragment slot="title">Name</svelte:fragment>
            <svelte:fragment slot="aside">
                <InputText
                    required
                    id="name"
                    label="Name"
                    placeholder="Enter name"
                    readonly={$readOnly && !GRACE_PERIOD_OVERRIDE}
                    bind:value={name} />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={name === data.bucket.name ||
                        !name ||
                        ($readOnly && !GRACE_PERIOD_OVERRIDE)}
                    submit>
                    Update
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form onSubmit={updatePermissions}>
        <CardGrid hideOverflow>
            <svelte:fragment slot="title">Permissions</svelte:fragment>
            Choose who can access your buckets and files. For more information, visit our
            <Link.Anchor
                href="https://appwrite.io/docs/advanced/platform/permissions"
                target="_blank"
                rel="noopener noreferrer">
                Permissions guide
            </Link.Anchor>.
            <svelte:fragment slot="aside">
                {#if permissions}
                    <Permissions bind:permissions withCreate />
                {/if}
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button disabled={$arePermsDisabled} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form onSubmit={updateFileSecurity}>
        <CardGrid>
            <svelte:fragment slot="title">File security</svelte:fragment>
            <svelte:fragment slot="aside">
                <Selector.Switch bind:checked={fileSecurity} id="security" label="File security" />
                <Typography.Text>
                    When file security is enabled, users will be able to access files for which they
                    have been granted <b>either File or Bucket permissions</b>.
                </Typography.Text>
                <Typography.Text>
                    If file security is disabled, users can access files <b
                        >only if they have Bucket permissions</b
                    >. File permissions will be ignored..
                </Typography.Text>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button
                    disabled={fileSecurity === data.bucket.fileSecurity ||
                        ($readOnly && !GRACE_PERIOD_OVERRIDE)}
                    submit>
                    Update
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form onSubmit={updateSecurity}>
        <CardGrid>
            <svelte:fragment slot="title">Security settings</svelte:fragment>
            Enable or disable security services for the bucket including <b>Ecryption</b>
            and <b>Antivirus scanning.</b>
            <svelte:fragment slot="aside">
                <Selector.Switch
                    label="Encryption"
                    id="encryption"
                    bind:checked={encryption}
                    description="This parameter allows you to configure whether or not the files inside the
                bucket will be encrypted. We don't encrypt files bigger than 20MB." />
                <Selector.Switch
                    label="Antivirus"
                    id="antivirus"
                    bind:checked={antivirus}
                    description="This parameter allows you to configure whether or not the files inside the
                    bucket should be scanned by the Appwrite Antivirus scanner." />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={encryption === data.bucket.encryption &&
                        antivirus === data.bucket.antivirus}
                    submit>
                    Update
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form onSubmit={updateCompression}>
        <CardGrid>
            <svelte:fragment slot="title">Compression</svelte:fragment>
            Choose an algorithm for compression. For files larger than 20MB, compression will be skipped
            even if it's enabled.
            <svelte:fragment slot="aside">
                <InputSelect
                    required
                    id="compression"
                    label="Algorithm"
                    options={compressionOptions}
                    bind:value={compression} />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={compression === data.bucket.compression} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <UpdateMaxFileSize currentPlan={data.currentPlan} />

    <Form onSubmit={updateAllowedExtensions}>
        <CardGrid hideOverflow>
            <svelte:fragment slot="title">Allowed file extension</svelte:fragment>
            Allowed file extensions. A maximum of 100 file extensions can be added. Leave blank to allow
            all file types.
            <svelte:fragment slot="aside">
                <Layout.Stack gap="s">
                    <InputTags
                        id="user-labels"
                        label="Labels"
                        placeholder="Select or type user labels"
                        bind:tags={extensions} />
                    <Layout.Stack direction="row">
                        {#each suggestedExtensions as ext}
                            <Tag
                                size="s"
                                selected={extensions.includes(ext)}
                                on:click={() => {
                                    if (!extensions.includes(ext)) {
                                        extensions = [...extensions, ext];
                                    } else {
                                        extensions = extensions.filter((e) => e !== ext);
                                    }
                                }}>
                                <Icon icon={IconPlus} slot="start" size="s" />
                                {ext}
                            </Tag>
                        {/each}
                    </Layout.Stack>
                </Layout.Stack>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={isExtensionsDisabled || ($readOnly && !GRACE_PERIOD_OVERRIDE)}
                    submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <CardGrid>
        <svelte:fragment slot="title">Delete bucket</svelte:fragment>
        The bucket will be permanently deleted, including all the files within it. This action is irreversible.
        <svelte:fragment slot="aside">
            <BoxAvatar>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{data.bucket.name}</h6>
                </svelte:fragment>
                <p class="text">Last updated: {toLocaleDateTime(data.bucket.$updatedAt)}</p>
            </BoxAvatar>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                secondary
                on:click={() => {
                    showDelete = true;
                    trackEvent(Click.StorageBucketDeleteClick);
                }}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
