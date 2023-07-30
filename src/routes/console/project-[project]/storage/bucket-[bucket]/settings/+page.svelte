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
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { get, writable } from 'svelte/store';
    import Delete from '../deleteBucket.svelte';
    import { bucket } from '../store';
    import UpdateMaxFileSize from './updateMaxFileSize.svelte';
    import LL from '$i18n/i18n-svelte';

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
                        <p class="text">
                            {$LL.console.project.forms.storage.texts.created()}
                            {toLocaleDateTime($bucket.$createdAt)}
                        </p>
                        <p class="text">
                            {$LL.console.project.forms.storage.texts.lastUpdated()}
                            {toLocaleDateTime($bucket.$updatedAt)}
                        </p>
                    </div>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={enabled === $bucket.enabled} submit
                        >{$LL.console.project.button.submit.update()}</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form onSubmit={updateName}>
            <CardGrid>
                <Heading tag="h6" size="7"
                    >{$LL.console.project.forms.storage.title.name()}</Heading>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputText
                            id="name"
                            label={$LL.console.project.forms.storage.inputs.name.label()}
                            placeholder={$LL.console.project.forms.storage.inputs.name.defaultPlaceholder()}
                            autocomplete={false}
                            bind:value={bucketName} />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={bucketName === $bucket.name || !bucketName} submit>
                        {$LL.console.project.button.submit.update()}
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form onSubmit={updatePermissions}>
            <CardGrid>
                <Heading tag="h6" size="7">{$LL.console.project.title.permissions()}</Heading>
                <p class="text">
                    {$LL.console.project.texts.storage.accessPermission()}
                    <a
                        href="https://appwrite.io/docs/permissions"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link">
                        {$LL.console.project.texts.storage.permissionGuide()}
                    </a>.
                </p>
                <svelte:fragment slot="aside">
                    {#if bucketPermissions}
                        <Permissions bind:permissions={bucketPermissions} withCreate />
                    {/if}
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button disabled={$arePermsDisabled} submit
                        >{$LL.console.project.button.submit.update()}</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form onSubmit={updateFileSecurity}>
            <CardGrid>
                <Heading tag="h6" size="7"
                    >{$LL.console.project.forms.storage.title.fileSecurity()}</Heading>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputSwitch
                            bind:value={bucketFileSecurity}
                            id="security"
                            label={$LL.console.project.forms.storage.inputs.security.label()} />
                    </FormList>
                    <p class="text">
                        {$LL.console.project.forms.storage.texts.enableFileSecurity()}
                        <b>{$LL.console.project.forms.storage.texts.fileAndBucketPermission()}</b>.
                    </p>
                    <p class="text">
                        {$LL.console.project.forms.storage.texts.fileDisabled()}
                        <b>{$LL.console.project.forms.storage.texts.onlyBucketPermission()}</b>. {$LL.console.project.forms.storage.texts.ignorePermission()}
                    </p>
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button disabled={bucketFileSecurity === $bucket.fileSecurity} submit>
                        {$LL.console.project.button.submit.update()}
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form onSubmit={updateSecurity}>
            <CardGrid>
                <Heading tag="h2" size="7"
                    >{$LL.console.project.forms.storage.title.securitySettings()}</Heading>
                <p class="text">
                    {$LL.console.project.forms.storage.texts.enableDisableSecurityService()}
                    <b>{$LL.console.project.forms.storage.texts.encruption()}</b>
                    {$LL.console.project.forms.storage.texts.and()}
                    <b>{$LL.console.project.forms.storage.texts.antivirusScanning()}</b>
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
                                    <div class="choice-item-title">
                                        {$LL.console.project.forms.storage.texts.encruption()}
                                    </div>

                                    <div class="choice-item-paragraph">
                                        {$LL.console.project.forms.storage.texts.configureEncruption()}
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
                                    <div class="choice-item-title">
                                        {$LL.console.project.forms.storage.texts.antivirus()}
                                    </div>

                                    <div class="choice-item-paragraph">
                                        {$LL.console.project.forms.storage.texts.configureAntiviruss()}
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
                        {$LL.console.project.button.submit.update()}
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form onSubmit={updateCompression}>
            <CardGrid>
                <Heading tag="h2" size="6"
                    >{$LL.console.project.forms.storage.title.compression()}</Heading>
                <p class="text">
                    {$LL.console.project.forms.storage.texts.chooseCompressionAlgo()}
                </p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputSelect
                            id="compression"
                            label={$LL.console.project.forms.storage.inputs.algorithm.label()}
                            options={compressionOptions}
                            bind:value={compression} />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={compression === $bucket.compression} submit
                        >{$LL.console.project.button.submit.update()}</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <UpdateMaxFileSize />

        <Form onSubmit={updateAllowedExtensions}>
            <CardGrid>
                <Heading tag="h6" size="7"
                    >{$LL.console.project.forms.storage.title.fileExtensions()}</Heading>
                <p class="text">
                    {$LL.console.project.forms.storage.texts.allowedFileExtensions()}
                </p>
                <svelte:fragment slot="aside">
                    <ul class="common-section">
                        <InputTags
                            id="read"
                            label={$LL.console.project.forms.storage.inputs.extensions.label()}
                            placeholder={$LL.console.project.forms.storage.inputs.extensions.placeholder()}
                            bind:tags={extensions} />
                        <li class="u-flex u-gap-12 u-margin-block-start-8">
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
                    <Button disabled={isExtensionsDisabled} submit
                        >{$LL.console.project.button.submit.update()}</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid danger>
            <Heading tag="h6" size="7">{$LL.console.project.title.deleteBucket()}</Heading>
            <p class="text">
                {$LL.console.project.texts.storage.permanentDeleteBucket()}
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$bucket.name}</h6>
                    </svelte:fragment>
                    <p class="text">
                        {$LL.console.project.texts.storage.lastUpdated()}
                        {toLocaleDateTime($bucket.$updatedAt)}
                    </p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}
                    >{$LL.console.project.button.submit.delete()}</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
