<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { realtime, sdk } from '$lib/stores/sdk';
    import { getProjectId } from '$lib/helpers/project';
    import { addNotification } from '$lib/stores/notifications';
    import { Layout, Typography, Code } from '@appwrite.io/pink-svelte';
    import { type Models, type Payload } from '@appwrite.io/console';
    import { Modal } from '$lib/components';
    import { Query } from '@appwrite.io/console';

    type ExportItem = {
        status: string;
        table?: string;
        bucketId?: string;
        bucketName?: string;
        fileName?: string;
        downloadUrl?: string;
        errors?: string[];
    };

    type ExportItemsMap = Map<string, ExportItem>;

    let exportItems = $state<ExportItemsMap>(new Map());

    function downloadExportedFile(downloadUrl: string) {
        if (!downloadUrl) {
            return;
        }

        window.open(downloadUrl, '_blank');
    }

    async function showErrorNotification(payload: Payload) {
        let errorMessage = 'Export failed. Please try again.';
        try {
            const parsed = JSON.parse(payload.errors[0]);
            errorMessage = parsed?.message || errorMessage;
        } catch {
            errorMessage = payload.errors[0] || errorMessage;
        }

        addNotification({
            type: 'error',
            message: errorMessage,
            isHtml: true,
            timeout: 10000,
        });
    }

    async function updateOrAddItem(exportData: Payload | Models.Migration) {
        if (exportData.destination?.toLowerCase() !== 'csv') return;

        const status = exportData.status;
        const current = exportItems.get(exportData.$id);
        let tableName = current?.table;

        // Get bucket, filename, and download URL from migration options
        const options = ('options' in exportData ? exportData.options : {}) || {};
        const bucketId = options.bucketId || '';
        const fileName = options.filename || '';
        const downloadUrl = options.downloadUrl || '';
        let bucketName = current?.bucketName;

        const existing = exportItems.get(exportData.$id);

        const isDone = (s: string) => ['completed', 'failed'].includes(s);
        const isInProgress = (s: string) => ['pending', 'processing'].includes(s);

        // Skip if we're trying to set an in-progress status on a completed migration
        const shouldSkip = existing && isDone(existing.status) && isInProgress(status);

        const hasNewData =
            downloadUrl && (!existing?.downloadUrl || existing.downloadUrl !== downloadUrl);
        const shouldSkipDuplicate = existing?.status === status && !hasNewData;

        if (shouldSkip || shouldSkipDuplicate) return;

        exportItems.set(exportData.$id, {
            status,
            table: tableName ?? current?.table,
            bucketId: bucketId,
            bucketName: bucketName,
            fileName: fileName,
            downloadUrl: downloadUrl,
            errors: exportData.errors || []
        });

        exportItems = new Map(exportItems);

        switch (status) {
            case 'completed':
                if (downloadUrl) {
                    downloadExportedFile(downloadUrl);
                }
                break;
            case 'failed':
                await showErrorNotification(exportData);
                break;
        }
    }

    function clear() {
        exportItems = new Map();
    }

    function graphSize(status: string): number {
        switch (status) {
            case 'pending':
                return 10;
            case 'processing':
                return 60;
            case 'completed':
            case 'failed':
                return 100;
            default:
                return 30;
        }
    }

    function text(status: string, tableName = '') {
        const table = tableName ? `<b>${tableName}</b>` : '';
        switch (status) {
            case 'completed':
                return `Exporting ${table} completed`;
            case 'failed':
                return `Exporting ${table} failed`;
            case 'processing':
                return `Exporting ${table}`;
            default:
                return 'Preparing export...';
        }
    }

    onMount(() => {
        sdk.forProject(page.params.region, page.params.project)
            .migrations.list({
                queries: [
                    Query.equal('destination', 'CSV'),
                    Query.equal('status', ['pending', 'processing'])
                ]
            })
            .then((migrations) => {
                migrations.migrations.forEach(updateOrAddItem);
            });

        return realtime.forConsole(page.params.region, 'console', (response) => {
            if (!response.channels.includes(`projects.${getProjectId()}`)) return;
            if (response.events.includes('migrations.*')) {
                updateOrAddItem(response.payload as Payload);
            }
        });
    });

    let isOpen = $state(true);
    let showCsvExportBox = $derived(exportItems.size > 0);
    let showErrorModal = $state(false);
    let selectedErrors = $state<string[]>([]);
</script>

{#if showCsvExportBox}
    <Layout.Stack direction="column" gap="l" alignItems="flex-end">
        <section class="upload-box">
            <header class="upload-box-header">
                <h4 class="upload-box-title">
                    <Typography.Text variant="m-500">
                        Exporting rows ({exportItems.size})
                    </Typography.Text>
                </h4>
                <button
                    class="upload-box-button"
                    class:is-open={isOpen}
                    aria-label="toggle upload box"
                    onclick={() => (isOpen = !isOpen)}>
                    <span class="icon-cheveron-up" aria-hidden="true"></span>
                </button>
                <button class="upload-box-button" aria-label="close export box" onclick={clear}>
                    <span class="icon-x" aria-hidden="true"></span>
                </button>
            </header>

            <div class="upload-box-content-list">
                {#each [...exportItems.entries()] as [key, value] (key)}
                    <div class="upload-box-content" class:is-open={isOpen}>
                        <ul class="upload-box-list">
                            <li class="upload-box-item">
                                <section class="progress-bar u-width-full-line">
                                    <div
                                        class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                        <Typography.Text>
                                            {@html text(value.status, value.table)}
                                        </Typography.Text>
                                        {#if value.status === 'failed' && value.errors && value.errors.length > 0}
                                            <button
                                                class="link"
                                                type="button"
                                                onclick={() => {
                                                    selectedErrors = value.errors;
                                                    showErrorModal = true;
                                                }}>
                                                more details
                                            </button>
                                        {/if}
                                    </div>
                                    <div
                                        class="progress-bar-container"
                                        class:is-danger={value.status === 'failed'}
                                        style="--graph-size:{graphSize(value.status)}%">
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

<Modal bind:show={showErrorModal} title="Export error details" hideFooter>
    {#if selectedErrors.length > 0}
        <Code
            code={JSON.stringify(
                selectedErrors.map((err) => {
                    try {
                        return JSON.parse(err);
                    } catch {
                        return err;
                    }
                }),
                null,
                2
            )}
            lang="json"
            hideHeader />
    {/if}
</Modal>

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
