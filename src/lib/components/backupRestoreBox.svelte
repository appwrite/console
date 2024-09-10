<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { type Models, Query } from '@appwrite.io/console';
    import { onMount } from 'svelte';

    let showBackupBox = false;
    let showRestoreBox = false;

    let backupRestoreItems: {
        archives: Map<string, Models.BackupArchive>;
        restorations: Map<string, Models.BackupRestoration>;
    } = {
        archives: new Map(),
        restorations: new Map()
    };

    const fetchBackupRestores = async () => {
        try {
            const query = [Query.notEqual('status', ['completed', 'failed'])];
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

        showBackupBox = backupRestoreItems.archives.size > 0;
        showRestoreBox = backupRestoreItems.restorations.size > 0;
    };

    // fresh fetch.
    fetchBackupRestores();

    const updateOrAddItem = (payload) => {
        const { $id, status, $collection } = payload;

        if ($collection in backupRestoreItems) {
            const collectionMap = backupRestoreItems[$collection];

            if (collectionMap.has($id)) {
                collectionMap.get($id).status = status;
            } else if (status === 'pending' || status === 'processing' || status === 'uploading') {
                collectionMap.set($id, payload);
            }

            backupRestoreItems[$collection] = collectionMap;

            showBackupBox = $collection === 'archives' && backupRestoreItems.archives.size > 0;
            showRestoreBox =
                $collection === 'restorations' && backupRestoreItems.restorations.size > 0;
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

    const handleClose = (which: 'archives' | 'restorations') => {
        backupRestoreItems[which] = new Map();
        showBackupBox = backupRestoreItems.archives.size > 0;
        showRestoreBox = backupRestoreItems.restorations.size > 0;
    };

    const reversed = (backupItem: Map<string, Models.BackupArchive | Models.BackupRestoration>) =>
        [...backupItem.values()].reverse();

    onMount(() => {
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

{#if showBackupBox}
    <div class="u-flex u-flex-vertical u-gap-16">
        <section
            class="upload-box is-float"
            style="inset-block-end: {showRestoreBox ? '10.25rem' : null}">
            <header class="upload-box-header">
                <h4 class="upload-box-title">
                    <span class="text">Creating Backup</span>
                </h4>
                <button
                    class="upload-box-button"
                    aria-label="close backup restore box"
                    on:click={() => handleClose('archives')}>
                    <span class="icon-x" aria-hidden="true" />
                </button>
            </header>

            <div class="upload-box-content is-open">
                <!-- reversing shouldn't have much overhead as the items would be less -->
                {#each reversed(backupRestoreItems.archives) as item, index (item.$id)}
                    <section
                        class="progress-bar"
                        class:u-padding-block-end-32={index !==
                            backupRestoreItems.archives.size - 1}>
                        <div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                            <span> Preparing database server for backup </span>
                        </div>
                        <div
                            class="progress-bar-container"
                            class:is-danger={item.status === 'failed'}
                            style="--graph-size:{graphSize(item.status)}%" />
                    </section>
                {/each}
            </div>
        </section>
    </div>
{/if}

{#if showRestoreBox}
    <div class="u-flex u-flex-vertical u-gap-16">
        <section class="upload-box is-float">
            <header class="upload-box-header">
                <h4 class="upload-box-title">
                    <span class="text">Creating Restoration</span>
                </h4>
                <button
                    class="upload-box-button"
                    aria-label="close backup restore box"
                    on:click={() => handleClose('restorations')}>
                    <span class="icon-x" aria-hidden="true" />
                </button>
            </header>

            <div class="upload-box-content is-open">
                <!-- reversing shouldn't have much overhead as the items would be less -->
                {#each reversed(backupRestoreItems.restorations) as item, index (item.$id)}
                    <section
                        class="progress-bar"
                        class:u-padding-block-end-32={index !==
                            backupRestoreItems.restorations.size - 1}>
                        <div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                            <span> Preparing database server restore </span>
                        </div>
                        {#key item.status}
                            <div
                                class="progress-bar-container"
                                class:is-danger={item.status === 'failed'}
                                style="--graph-size:{graphSize(item.status)}%" />
                        {/key}
                    </section>
                {/each}
            </div>
        </section>
    </div>
{/if}

<style>
    .upload-box-content {
        padding: 1.5rem;
        min-width: 400px;
        max-width: 100vw;
    }
</style>
