<script lang="ts">
    import { debounce } from '$lib/helpers/debounce';
    import { sdk } from '$lib/stores/sdk';
    import { type Models, Query } from '@appwrite.io/console';
    import { onMount } from 'svelte';

    let showBackupRestoreBox = false;

    let backupRestoreItems: {
        archives: Models.BackupArchive[],
        restorations: Models.BackupRestoration[]
    } = {
        archives: [],
        restorations: []
    };

    const fetchBackupRestores = debounce(async () => {
        try {
            const query = [Query.notEqual('status', 'completed')];

            const [archivesResponse, restorationsResponse] = await Promise.all([
                sdk.forProject.backups.listArchives(query),
                sdk.forProject.backups.listRestorations(query)
            ]);

            backupRestoreItems.archives = archivesResponse.archives;
            backupRestoreItems.restorations = restorationsResponse.restorations;

            showBackupRestoreBox = backupRestoreItems.archives.length > 0 || backupRestoreItems.restorations.length > 0;
        } catch (e) {
            showBackupRestoreBox = false;
        }
    }, 1000);

    fetchBackupRestores();

    const graphSize = (backupItem: Models.BackupArchive | Models.BackupRestoration) => {
        switch (backupItem.status) {
            case 'pending':
                return 25;
            case 'processing':
                return 50;
            case 'failed':
                return 100;
        }
    };

    function handleClose(): void {
        showBackupRestoreBox = false;
        backupRestoreItems.archives = [];
        backupRestoreItems.restorations = [];
    }

    onMount(() => {
        // TODO: @itznotabug, the events need to be fixed then we can use `archives.*`
        sdk.forConsole.client.subscribe(['project', 'console'], (response) => {
            console.log(response.events);
            if (response.events.includes('migrations.*')) {
                fetchBackupRestores();
            }
        });
    });
</script>

{#if showBackupRestoreBox}
    <div class="u-flex u-flex-vertical u-gap-16">
        {#each Object.keys(backupRestoreItems) as key, index}
            {@const items = backupRestoreItems[key]}
            {#if items.length > 0}
                <section class="upload-box is-float"
                         style="inset-block-end: {index === 1 && items.length > 0 ? '10.25rem' : null}">
                    <header class="upload-box-header">
                        <h4 class="upload-box-title">
                            <span class="text">{key === 'archives' ? 'Creating Backup' : 'Creating Restoration'}</span>
                        </h4>
                        <button class="upload-box-button" aria-label="close backup restore box" on:click={handleClose}>
                            <span class="icon-x" aria-hidden="true" />
                        </button>
                    </header>

                    <div class="upload-box-content is-open">
                        {#each items as item, index (item.$id)}
                            <section class="progress-bar"
                                     class:u-padding-block-end-32={index !== items.length - 1}>
                                <div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                    <span>
                                        Preparing database server for {key === 'archives' ? 'backup' : 'restore'}
                                    </span>
                                </div>
                                <div
                                    class="progress-bar-container"
                                    class:is-danger={item.status === 'failed'}
                                    style="--graph-size:{graphSize(item)}%" />
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
</style>
