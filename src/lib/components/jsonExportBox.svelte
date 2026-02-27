<script lang="ts">
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { jsonExportStore, type JsonExportJob } from '$lib/stores/jsonExport';
    import { addNotification } from '$lib/stores/notifications';

    let isOpen = $state(true);

    // Convert store Map to a plain array for safe iteration in Svelte 5
    let jobEntries = $state<[string, JsonExportJob][]>([]);
    let jobCount = $state(0);

    jsonExportStore.subscribe((map) => {
        jobEntries = [...map.entries()];
        jobCount = map.size;
    });

    let showBox = $derived(jobCount > 0);

    function graphSize(status: string, fetched: number, total: number): number {
        switch (status) {
            case 'pending':
                return 5;
            case 'processing':
                return total > 0 ? Math.max(10, Math.round((fetched / total) * 100)) : 30;
            case 'completed':
            case 'failed':
                return 100;
            default:
                return 10;
        }
    }

    function text(job: JsonExportJob): string {
        switch (job.status) {
            case 'completed':
                return 'completed';
            case 'failed':
                return 'failed';
            case 'processing':
                return job.totalRows > 0
                    ? `(${job.fetchedRows}/${job.totalRows} rows)`
                    : '';
            default:
                return '';
        }
    }

    // Track completed exports to fire notifications
    let notifiedJobs = new Set<string>();

    $effect(() => {
        // Prune stale jobs
        for (const key of notifiedJobs) {
            if (!jobEntries.some(([k]) => k === key)) {
                notifiedJobs.delete(key);
            }
        }

        for (const [key, job] of jobEntries) {
            if (notifiedJobs.has(key)) continue;

            if (job.status === 'completed') {
                notifiedJobs.add(key);
                addNotification({
                    type: 'success',
                    message: `Exported ${job.fetchedRows} rows as JSON`,
                    timeout: 10000
                });
            } else if (job.status === 'failed') {
                notifiedJobs.add(key);
                addNotification({
                    type: 'error',
                    message: job.error || 'JSON export failed',
                    timeout: 10000
                });
            }
        }
    });
</script>

{#if showBox}
    <Layout.Stack direction="column" gap="l" alignItems="flex-end">
        <section class="upload-box">
            <header class="upload-box-header">
                <h4 class="upload-box-title">
                    <Typography.Text variant="m-500">
                        Exporting rows ({jobCount})
                    </Typography.Text>
                </h4>
                <button
                    class="upload-box-button"
                    class:is-open={isOpen}
                    aria-label="toggle export box"
                    onclick={() => (isOpen = !isOpen)}>
                    <span class="icon-cheveron-up" aria-hidden="true"></span>
                </button>
                <button
                    class="upload-box-button"
                    aria-label="close export box"
                    onclick={() => jsonExportStore.clear()}>
                    <span class="icon-x" aria-hidden="true"></span>
                </button>
            </header>

            <div class="upload-box-content-list">
                {#each jobEntries as [key, job] (key)}
                    <div class="upload-box-content" class:is-open={isOpen}>
                        <ul class="upload-box-list">
                            <li class="upload-box-item">
                                <section class="progress-bar u-width-full-line">
                                    <div
                                        class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                        <Typography.Text>
                                            Exporting <Typography.Text variant="m-600">{job.tableName}</Typography.Text> {text(job)}
                                        </Typography.Text>
                                    </div>
                                    <div
                                        class="progress-bar-container"
                                        class:is-danger={job.status === 'failed'}
                                        style="--graph-size:{graphSize(
                                            job.status,
                                            job.fetchedRows,
                                            job.totalRows
                                        )}%">
                                    </div>
                                </section>
                            </li>
                        </ul>
                    </div>
                {/each}
            </div>
        </section>
    </Layout.Stack>
{/if}

<style lang="scss">
    .upload-box {
        display: flex;
        max-height: 320px;
        flex-direction: column;
    }

    .upload-box-header {
        flex-shrink: 0;
    }

    .upload-box-title {
        font-size: 11px;
    }

    .upload-box-content-list {
        overflow-y: auto;
    }

    .upload-box-content {
        width: 304px;
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
