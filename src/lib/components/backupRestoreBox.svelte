<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { Query } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import type { BackupArchive, BackupRestoration } from '$lib/sdk/backups';
    import { invalidate } from '$app/navigation';

    let backupRestoreItems: {
        archives: Map<string, BackupArchive>;
        restorations: Map<string, BackupRestoration>;
    } = {
        archives: new Map(),
        restorations: new Map()
    };

    $: showBackupRestoreBox =
        backupRestoreItems.archives.size > 0 || backupRestoreItems.restorations.size > 0;

    const fetchBackupRestores = async () => {
        try {
            const query = [
                Query.notEqual('status', ['failed']),
                Query.notEqual('status', ['completed'])
            ];

            const [archivesResponse, restorationsResponse] = await Promise.all([
                sdk.forProject.backups.listArchives(query),
                sdk.forProject.backups.listRestorations(query)
            ]);

            // this is a one time op.
            backupRestoreItems.archives = new Map(
                archivesResponse.archives.map((item) => [item.$id, item])
            );

            backupRestoreItems.restorations = new Map(
                restorationsResponse.restorations.map((item) => [item.$id, item])
            );
        } catch (e) {
            // ignore?
        }
    };

    // fresh fetch.
    fetchBackupRestores();

    const updateOrAddItem = (payload) => {
        const { $id, status, $collection } = payload;
        if ($collection in backupRestoreItems) {
            const collectionMap = backupRestoreItems[$collection];

            if (collectionMap.has($id)) {
                collectionMap.get($id).status = status;
                if (status === 'completed') invalidate(Dependencies.BACKUPS);
            } else if (status === 'pending' || status === 'processing' || status === 'uploading') {
                collectionMap.set($id, payload);
            }
            backupRestoreItems[$collection] = collectionMap;
        }
    };

    const graphSize = (status: string) => {
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
    };

    const handleClose = (which: string) => {
        backupRestoreItems[which] = new Map();
    };

    // TODO: `startedAt` is probably not correct here. need more info.
    const backupName = (item: BackupArchive | BackupRestoration, key: string) => {
        const attribute = key === 'archives' ? '$createdAt' : 'startedAt';
        const date = new Date(item[attribute]);
        return `${date.toDateString().slice(4, 10)}, ${date.toTimeString().slice(0, 5)}`;
    };

    onMount(() => {
        // fast path: don't subscribe if org is on a free plan or is self-hosted.
        if (isSelfHosted || (isCloud && $organization.billingPlan === BillingPlan.FREE)) return;

        sdk.forConsole.client.subscribe('console', (response) => {
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
            {@const titleText = isBackup ? 'Creating Backup' : 'Creating Restoration'}

            {#if items.size > 0}
                <section class="upload-box is-float">
                    <header class="upload-box-header">
                        <h4 class="upload-box-title">
                            <span class="text">{titleText}</span>
                        </h4>
                        <button
                            class="upload-box-button"
                            aria-label="close backup restore box"
                            on:click={() => handleClose(key)}>
                            <span class="icon-x" aria-hidden="true" />
                        </button>
                    </header>

                    <div class="upload-box-content is-open">
                        {#each [...items.values()] as item, index (item.$id)}
                            <section
                                class="progress-bar"
                                class:u-padding-block-end-32={index !== items.size - 1}>
                                <div
                                    class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                    <span class="body-text-2"> Preparing database... </span>

                                    <span class="backup-name">
                                        {backupName(item, key)}
                                    </span>
                                </div>
                                <div
                                    class="progress-bar-container"
                                    class:is-danger={item.status === 'failed'}
                                    style="--graph-size:{graphSize(item.status)}%" />
                            </section>
                        {/each}
                    </div>
                </section>
            {/if}
        {/each}
    </div>
{/if}

<style>
    .upload-box-content {
        padding: 1.5rem;
        min-width: 400px;
        max-width: 100vw;
    }

    .box-holder {
        right: 2rem;
        bottom: 1rem;
        display: flex;
        position: fixed;
    }

    .is-float {
        position: relative;
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
