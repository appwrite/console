<script lang="ts">
    import { realtime } from '$lib/stores/sdk';
    import { type Payload } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import type { BackupArchive, BackupRestoration } from '$lib/sdk/backups';
    import { goto, invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { addNotification } from '$lib/stores/notifications';
    import { base } from '$app/paths';
    import { getProjectId } from '$lib/helpers/project';
    import { toLocaleDate } from '$lib/helpers/date';

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
            const region = $page.params.region;
            const project = $page.params.project;
            lastDatabaseRestorationId = newDatabaseId;

            addNotification({
                type: 'success',
                isHtml: true,
                message: `Restoration complete. <b>${newDatabaseName}</b> has been created.`,
                buttons: [
                    {
                        name: 'View restored data',
                        method: () => {
                            goto(
                                `${base}/project-${region}-${project}/databases/database-${newDatabaseId}`
                            );
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

        return realtime
            .forProject($page.params.region, $page.params.project)
            .subscribe('console', (response) => {
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
                            <span class="text">{titleText} ({items.size})</span>
                        </h4>
                        <button
                            class="upload-box-button"
                            class:is-open={openStates[key]}
                            aria-label="toggle upload box"
                            on:click={() => {
                                openStates[key] = !openStates[key];
                            }}>
                            <span class="icon-cheveron-up" aria-hidden="true" />
                        </button>
                        <button
                            class="upload-box-button"
                            aria-label="close backup restore box"
                            on:click={() => handleClose(key)}>
                            <span class="icon-x" aria-hidden="true" />
                        </button>
                    </header>

                    <div class="upload-box-content" class:is-open={openStates[key]}>
                        <ul class="upload-box-list">
                            {#each [...items.values()] as item (item.$id)}
                                <li class="upload-box-item">
                                    <section class="progress-bar u-width-full-line">
                                        <div
                                            class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                            <span class="body-text-2">
                                                {text(item.status, key)}
                                            </span>

                                            <span class="backup-name">
                                                {backupName(item, key)}
                                            </span>
                                        </div>
                                        <div
                                            class="progress-bar-container"
                                            class:is-danger={item.status === 'failed'}
                                            style="--graph-size:{graphSize(item.status)}%" />
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

<style>
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

    .backup-name {
        font-size: 12px;
        font-weight: 400;
        line-height: 130%;
        font-style: normal;
        letter-spacing: -0.12px;
        color: var(--mid-neutrals-50, #818186);
        font-family: var(--font-family-sansSerif, Inter);
    }
</style>
