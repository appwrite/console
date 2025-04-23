<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { type Payload } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import type { BackupArchive, BackupRestoration } from '$lib/sdk/backups';
    import { goto, invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { base } from '$app/paths';
    import { getProjectId } from '$lib/helpers/project';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Typography } from '@appwrite.io/pink-svelte';

    const backupRestoreItems: {
        archives: Map<string, BackupArchive>;
        restorations: Map<string, BackupRestoration>;
    } = {
        archives: new Map(),
        restorations: new Map()
    };

    const openStates = {
        archives: true,
        restorations: true
    };

    $: showBackupRestoreBox =
        backupRestoreItems.archives.size > 0 || backupRestoreItems.restorations.size > 0;

    let lastDatabaseRestorationId = null;

    function showRestoreNotification(newDatabaseId: string, newDatabaseName: string) {
        if (newDatabaseId && newDatabaseName && lastDatabaseRestorationId !== newDatabaseId) {
            const project = page.params.project;
            lastDatabaseRestorationId = newDatabaseId;

            addNotification({
                type: 'success',
                isHtml: true,
                message: `Restoration complete. <b>${newDatabaseName}</b> has been created.`,
                buttons: [
                    {
                        name: 'View restored data',
                        method: () => {
                            goto(`${base}/project-${project}/databases/database-${newDatabaseId}`);
                        }
                    }
                ]
            });
        }
    }

    function updateOrAddItem(payload: Payload) {
        const { $id, status, $collection, policyId } = payload;
        if ($collection === 'archives' && policyId !== null) {
            return;
        }

        if ($collection in backupRestoreItems) {
            const collectionMap = backupRestoreItems[$collection];

            if (collectionMap.has($id)) {
                collectionMap.get($id).status = status;
                if (status === 'completed') {
                    invalidate(Dependencies.BACKUPS);

                    if ($collection === 'restorations') {
                        const { newId, newName } =
                            collectionMap.get($id).options?.['databases']?.['database'][0] || {};

                        showRestoreNotification(newId, newName);
                    }
                }
            } else if (status === 'pending' || status === 'processing' || status === 'uploading') {
                collectionMap.set($id, payload);
            }
            backupRestoreItems[$collection] = collectionMap;
        }
    }

    function graphSize(status: string): number {
        switch (status) {
            case 'pending':
                return 10;
            case 'processing':
                return 30;
            case 'uploading':
                return 60;
            case 'completed':
            case 'failed':
                return 100;
            default:
                return 0;
        }
    }

    function text(status: string, key: string) {
        const service = key === 'archives' ? 'backup' : 'restore';
        if (status === 'completed') {
            return `Database ${service} complete`;
        } else if (status === 'failed') {
            return `Database ${service} failed`;
        } else {
            return 'Preparing database...';
        }
    }

    function handleClose(which: string) {
        backupRestoreItems[which] = new Map();
        if (which === 'restorations') lastDatabaseRestorationId = null;
    }

    function backupName(item: BackupArchive | BackupRestoration, key: string) {
        const attribute = key === 'archives' ? '$createdAt' : 'startedAt';

        return toLocaleDate(item[attribute]);
    }

    onMount(() => {
        // fast path: don't subscribe if org is on a free plan or is self-hosted.
        if (isSelfHosted || (isCloud && $organization.billingPlan === BillingPlan.FREE)) return;

        return sdk.forConsole.client.subscribe('console', (response) => {
            if (!response.channels.includes(`projects.${getProjectId()}`)) return;

            if (
                response.events.includes('archives.*') ||
                response.events.includes('restorations.*')
            ) {
                updateOrAddItem(response.payload);
            }
        });
    });
</script>

{#if showBackupRestoreBox}
    <div class="box-holder u-flex u-flex-vertical u-gap-16" style="align-items: end">
        {#each Object.keys(backupRestoreItems) as key}
            {@const isBackup = key === 'archives'}
            {@const items = backupRestoreItems[key]}
            {@const titleText = isBackup ? 'Backup status' : 'Restoration status'}

            {#if items.size > 0}
                <section class="upload-box">
                    <header class="upload-box-header">
                        <h4 class="upload-box-title">
                            <Typography.Text variant="m-500">
                                {titleText} ({items.size})
                            </Typography.Text>
                        </h4>
                        <button
                            class="upload-box-button"
                            class:is-open={openStates[key]}
                            aria-label="toggle upload box"
                            on:click={() => {
                                openStates[key] = !openStates[key];
                            }}>
                            <span class="icon-cheveron-up" aria-hidden="true"></span>
                        </button>
                        <button
                            class="upload-box-button"
                            aria-label="close backup restore box"
                            on:click={() => handleClose(key)}>
                            <span class="icon-x" aria-hidden="true"></span>
                        </button>
                    </header>

                    <div class="upload-box-content" class:is-open={openStates[key]}>
                        <ul class="upload-box-list">
                            {#each [...items.values()] as item (item.$id)}
                                <li class="upload-box-item">
                                    <section class="progress-bar u-width-full-line">
                                        <div
                                            class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                            <Typography.Text>
                                                {text(item.status, key)}
                                            </Typography.Text>

                                            <Typography.Caption variant="400">
                                                {backupName(item, key)}
                                            </Typography.Caption>
                                        </div>
                                        <div
                                            class="progress-bar-container"
                                            class:is-danger={item.status === 'failed'}
                                            style="--graph-size:{graphSize(item.status)}%">
                                        </div>
                                    </section>
                                </li>
                            {/each}
                        </ul>
                    </div>
                </section>
            {/if}
        {/each}
    </div>
{/if}

<style lang="scss">
    .upload-box-title {
        font-size: 11px;
    }

    .upload-box-content {
        min-width: 400px;
        max-width: 100vw;
    }

    .upload-box-button {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .progress-bar-container {
        height: 4px;

        &::before {
            height: 4px;
            background-color: var(--bgcolor-neutral-invert);
        }

        &.is-danger::before {
            height: 4px;
            background-color: var(--bgcolor-error);
        }
    }
</style>
