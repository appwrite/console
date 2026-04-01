<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { type Models } from '@appwrite.io/console';
    import { Provider } from '$lib/sdk/dedicated';
    import { Layout } from '@appwrite.io/pink-svelte';

    let {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    type BackupStorageProvider = 's3' | 'gcs' | 'azure';

    const providerOptions: { value: BackupStorageProvider; label: string }[] = [
        { value: 's3', label: 'Amazon S3' },
        { value: 'gcs', label: 'Google Cloud Storage' },
        { value: 'azure', label: 'Azure Blob Storage' }
    ];

    let config: Models.DedicatedDatabaseBackupStorage | null = $state(null);
    let isLoading = $state(true);
    let isConfigured = $state(false);

    let provider: BackupStorageProvider = $state('s3');
    let bucket: string = $state('');
    let region: string = $state('');
    let accessKeyId: string = $state('');
    let secretAccessKey: string = $state('');
    let prefix: string = $state('');
    let endpoint: string = $state('');

    let isSubmitting = $state(false);
    let showRemoveConfirm = $state(false);
    let isRemoving = $state(false);

    onMount(async () => {
        try {
            const projectSdk = sdk.forProject(page.params.region, page.params.project);
            config = await projectSdk.compute.getBackupStorageConfig({ databaseId: database.$id });
            isConfigured = true;
        } catch {
            // 404 means not configured
            isConfigured = false;
            config = null;
        } finally {
            isLoading = false;
        }
    });

    async function configureStorage() {
        isSubmitting = true;
        try {
            config = await sdk
                .forProject(page.params.region, page.params.project)
                .compute.updateDatabaseBackupStorage({
                    databaseId: database.$id,
                    provider: provider as Provider,
                    bucket,
                    accessKey: accessKeyId,
                    secretKey: secretAccessKey,
                    region: region || undefined,
                    prefix: prefix || undefined,
                    endpoint: endpoint || undefined
                });

            isConfigured = true;

            // Reset sensitive fields
            accessKeyId = '';
            secretAccessKey = '';

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Backup storage has been configured',
                type: 'success'
            });

            trackEvent(Submit.DatabaseConfigureBackupStorage);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseConfigureBackupStorage);
        } finally {
            isSubmitting = false;
        }
    }

    async function removeStorage() {
        isRemoving = true;
        try {
            const projectSdk = sdk.forProject(page.params.region, page.params.project);
            await projectSdk.compute.deleteBackupStorageConfig({ databaseId: database.$id });

            isConfigured = false;
            config = null;
            showRemoveConfirm = false;

            // Reset form
            provider = 's3';
            bucket = '';
            region = '';
            accessKeyId = '';
            secretAccessKey = '';
            prefix = '';
            endpoint = '';

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Backup storage configuration has been removed',
                type: 'success'
            });

            trackEvent(Submit.DatabaseDeleteBackupStorage);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseDeleteBackupStorage);
        } finally {
            isRemoving = false;
        }
    }
</script>

{#if !isLoading}
    {#if isConfigured && config}
        <CardGrid>
            <svelte:fragment slot="title">Backup storage</svelte:fragment>
            Your database backups are stored on an external storage provider for added durability and
            disaster recovery.
            <svelte:fragment slot="aside">
                <ul>
                    <li class="u-margin-block-end-16">
                        <div class="box">
                            <Layout.Stack direction="column" gap="xs">
                                <Layout.Stack direction="row" gap="s">
                                    <span class="u-bold">Provider:</span>
                                    <span>
                                        {config.provider === 's3'
                                            ? 'Amazon S3'
                                            : config.provider === 'gcs'
                                              ? 'Google Cloud Storage'
                                              : 'Azure Blob Storage'}
                                    </span>
                                </Layout.Stack>
                                <Layout.Stack direction="row" gap="s">
                                    <span class="u-bold">Bucket:</span>
                                    <span>{config.bucket}</span>
                                </Layout.Stack>
                                <Layout.Stack direction="row" gap="s">
                                    <span class="u-bold">Region:</span>
                                    <span>{config.region}</span>
                                </Layout.Stack>
                                {#if config.prefix}
                                    <Layout.Stack direction="row" gap="s">
                                        <span class="u-bold">Prefix:</span>
                                        <span>{config.prefix}</span>
                                    </Layout.Stack>
                                {/if}
                                {#if config.endpoint}
                                    <Layout.Stack direction="row" gap="s">
                                        <span class="u-bold">Endpoint:</span>
                                        <span>{config.endpoint}</span>
                                    </Layout.Stack>
                                {/if}
                            </Layout.Stack>
                        </div>
                    </li>
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    secondary
                    on:click={() => {
                        showRemoveConfirm = true;
                    }}>
                    Remove
                </Button>
            </svelte:fragment>
        </CardGrid>
    {:else}
        <Form onSubmit={configureStorage}>
            <CardGrid>
                <svelte:fragment slot="title">Backup storage</svelte:fragment>
                Configure off-cluster backup storage to store backups on an external cloud provider for
                added durability and disaster recovery.
                <svelte:fragment slot="aside">
                    <ul>
                        <InputSelect
                            id="provider"
                            label="Provider"
                            bind:value={provider}
                            options={providerOptions} />
                        <InputText
                            id="bucket"
                            label="Bucket"
                            placeholder="my-backup-bucket"
                            bind:value={bucket}
                            required />
                        <InputText
                            id="storageRegion"
                            label="Region"
                            placeholder="us-east-1"
                            bind:value={region}
                            required />
                        <InputText
                            id="accessKeyId"
                            label="Access key ID"
                            placeholder="Enter access key ID"
                            bind:value={accessKeyId}
                            required />
                        <InputText
                            id="secretAccessKey"
                            label="Secret access key"
                            placeholder="Enter secret access key"
                            bind:value={secretAccessKey}
                            required />
                        <InputText
                            id="prefix"
                            label="Prefix (optional)"
                            placeholder="backups/"
                            bind:value={prefix} />
                        <InputText
                            id="endpoint"
                            label="Endpoint (optional)"
                            placeholder="https://s3.amazonaws.com"
                            bind:value={endpoint} />
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        disabled={!bucket ||
                            !region ||
                            !accessKeyId ||
                            !secretAccessKey ||
                            isSubmitting}
                        submit>
                        {isSubmitting ? 'Configuring...' : 'Configure'}
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
    {/if}

    <Modal title="Remove backup storage" bind:show={showRemoveConfirm} onSubmit={removeStorage}>
        <p class="text">
            Are you sure you want to remove the off-cluster backup storage configuration for
            <b>{database.name}</b>? Existing backups in the external storage will not be deleted,
            but new backups will no longer be stored externally.
        </p>
        <svelte:fragment slot="footer">
            <Button
                text
                on:click={() => {
                    showRemoveConfirm = false;
                }}>Cancel</Button>
            <Button danger submit disabled={isRemoving}>
                {isRemoving ? 'Removing...' : 'Remove'}
            </Button>
        </svelte:fragment>
    </Modal>
{/if}
