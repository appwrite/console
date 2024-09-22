<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { type Models, Query } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';

    let backupRestoreItems: {
        archives: Models.BackupArchive[];
        restorations: Models.BackupRestoration[];
    } = {
        archives: [],
        restorations: []
    };

    $: showBackupRestoreBox =
        backupRestoreItems.archives.length > 0 || backupRestoreItems.restorations.length > 0;

    const fetchBackupRestores = async (fromRealtime: boolean = false) => {
        // fast path: don't fetch if org is on a free plan or is self-hosted.
        if (isSelfHosted || (isCloud && $organization.billingPlan === BillingPlan.FREE)) return;

        try {
            const query = [Query.orderDesc('')];

            if (!fromRealtime) {
                query.push(
                    Query.notEqual('status', 'failed'),
                    Query.notEqual('status', 'completed')
                );
            }

            const [archivesResponse, restorationsResponse] = await Promise.all([
                sdk.forProject.backups.listArchives(query),
                sdk.forProject.backups.listRestorations(query)
            ]);

            // TODO: @itznotabug
            //  we should move to realtime after the cross org bug is taken care of.
            let filteredArchives = archivesResponse.archives;
            let filteredRestorations = restorationsResponse.restorations;

            let invalidateDependencies = false;

            if (fromRealtime) {
                const backupArchiveIds = new Set(
                    backupRestoreItems.archives.map((item) => item.$id)
                );

                const backupRestorationIds = new Set(
                    backupRestoreItems.restorations.map((item) => item.$id)
                );

                filteredArchives = archivesResponse.archives.filter((archive) => {
                    return (
                        (archive.status !== 'completed' && archive.status !== 'failed') ||
                        backupArchiveIds.has(archive.$id)
                    );
                });

                filteredRestorations = restorationsResponse.restorations.filter((restoration) => {
                    return (
                        (restoration.status !== 'completed' && restoration.status !== 'failed') ||
                        backupRestorationIds.has(restoration.$id)
                    );
                });

                invalidateDependencies = filteredArchives.length > 0;
            }

            backupRestoreItems.archives = filteredArchives;
            backupRestoreItems.restorations = filteredRestorations;

            if (invalidateDependencies) {
                invalidate(Dependencies.BACKUPS);
            }
        } catch (e) {
            // ignore?
        }
    };

    // fresh fetch.
    fetchBackupRestores();

    const graphSize = (status: string) => {
        switch (status) {
            case 'pending':
                return 10;
            case 'processing':
                return 30;
            case 'completed':
            case 'failed':
                return 100;
            default:
                return 0;
        }
    };

    const handleClose = (which: string) => {
        backupRestoreItems[which] = [];
    };

    // TODO: `startedAt` is probably not correct here. need more info.
    const backupName = (item: Models.BackupArchive | Models.BackupRestoration, key: string) => {
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
                fetchBackupRestores(true);
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

            {#if items.length > 0}
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
                        {#each items as item, index (item.$id)}
                            <section
                                class="progress-bar"
                                class:u-padding-block-end-32={index !== items.length - 1}>
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
        position: static;
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
