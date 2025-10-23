<script lang="ts">
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { getProjectId } from '$lib/helpers/project';
    import { addNotification } from '$lib/stores/notifications';
    import { Layout, Typography, Code } from '@appwrite.io/pink-svelte';
    import { type Models, type Payload, Query } from '@appwrite.io/console';
    import { Modal } from '$lib/components';

    type ExportItem = {
        status: string;
        table?: string;
        bucketId?: string;
        bucketName?: string;
        fileName?: string;
        errors?: string[];
    };

    type ExportItemsMap = Map<string, ExportItem>;

    let exportItems = $state<ExportItemsMap>(new Map());

    async function showCompletionNotification(
        table: string,
        bucketId: string,
        fileName: string,
        payload: Payload
    ) {
        const isSuccess = payload.status === 'completed';
        const isError = !isSuccess && !!payload.errors;

        if (!isSuccess && !isError) return;

        let errorMessage = 'Export failed. Please try again.';
        if (isError && Array.isArray(payload.errors) && payload.errors.length > 0) {
            try {
                const parsed = JSON.parse(payload.errors[0]);
                errorMessage = parsed?.message || errorMessage;
            } catch {
                errorMessage = payload.errors[0] || errorMessage;
            }
        }

        const type = isSuccess ? 'success' : 'error';
        const message = isError ? errorMessage : `"${table}" has been exported`;
        const region = page.params.region;
        const project = page.params.project;

        addNotification({
            type,
            message,
            isHtml: true,
            timeout: 10000,
            buttons: isSuccess
                ? [
                      {
                          name: 'View bucket',
                          method: () =>
                              goto(
                                  `${base}/project-${region}-${project}/storage/bucket-${bucketId}`
                              )
                      },
                      {
                          name: 'Download',
                          method: async () => {
                              try {
                                  const files = await sdk
                                      .forProject(region, project)
                                      .storage.listFiles({ bucketId });

                                  const file = files.files.find((f) => f.name === fileName);

                                  if (file) {
                                      const downloadUrl =
                                          sdk
                                              .forProject(region, project)
                                              .storage.getFileDownload({
                                                  bucketId,
                                                  fileId: file.$id
                                              })
                                              .toString() + '&mode=admin';

                                      window.open(downloadUrl, '_blank');
                                  } else {
                                      addNotification({
                                          type: 'error',
                                          message: `File "${fileName}" not found in bucket`
                                      });
                                  }
                              } catch (e) {
                                  addNotification({
                                      type: 'error',
                                      message: `Failed to download file: ${e.message}`
                                  });
                              }
                          }
                      }
                  ]
                : undefined
        });
    }

    async function updateOrAddItem(exportData: Payload | Models.Migration) {
        if (exportData.destination?.toLowerCase() !== 'csv') return;

        const status = exportData.status;
        const resourceId = exportData.resourceId ?? '';
        const [databaseId, tableId] = resourceId.split(':') ?? [];

        const current = exportItems.get(exportData.$id);
        let tableName = current?.table;

        // Get bucket and filename from migration options
        const options = ('options' in exportData ? exportData.options : {}) || {};
        const bucketId = options.bucketId || '';
        const fileName = options.filename || '';
        let bucketName = current?.bucketName;

        if (!tableName && tableId) {
            try {
                const table = await sdk
                    .forProject(page.params.region, page.params.project)
                    .tablesDB.getTable({
                        databaseId,
                        tableId
                    });
                tableName = table.name;
            } catch (error) {
                console.error('Failed to fetch table name:', error);
                tableName = null;
            }
        }

        if (!bucketName && bucketId) {
            try {
                const bucket = await sdk
                    .forProject(page.params.region, page.params.project)
                    .storage.getBucket({ bucketId });
                bucketName = bucket.name;
            } catch (error) {
                console.error('Failed to fetch bucket name:', error);
                bucketName = null;
            }
        }

        if (tableId && tableName === null) {
            exportItems.delete(exportData.$id);
            return;
        }

        const existing = exportItems.get(exportData.$id);

        const isDone = (s: string) => s === 'completed' || s === 'failed';
        const isInProgress = (s: string) => ['pending', 'processing'].includes(s);

        const shouldSkip =
            (existing && isDone(existing.status) && isInProgress(status)) ||
            existing?.status === status;

        if (shouldSkip) return;

        exportItems.set(exportData.$id, {
            status,
            table: tableName ?? current?.table,
            bucketId: bucketId,
            bucketName: bucketName,
            fileName: fileName,
            errors: exportData.errors || []
        });
        exportItems = new Map(exportItems);

        if (status === 'completed' || status === 'failed') {
            await showCompletionNotification(tableName ?? tableId, bucketId, fileName, exportData);
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

    function text(status: string, tableName = '', bucketName = '') {
        const table = tableName ? `<b>${tableName}</b>` : '';
        const bucket = bucketName ? `<b>${bucketName}</b>` : 'bucket';
        switch (status) {
            case 'completed':
                return `Export to ${bucket} completed`;
            case 'failed':
                return `Export to ${bucket} failed`;
            case 'processing':
                return `Exporting ${table} to ${bucket}`;
            default:
                return 'Preparing export...';
        }
    }

    onMount(() => {
        // Fetch initial data
        if (!page.params.region || !page.params.project) {
            return;
        }

        sdk.forProject(page.params.region, page.params.project)
            .migrations.list({
                queries: [
                    Query.equal('destination', 'CSV'),
                    Query.equal('status', ['pending', 'processing'])
                ]
            })
            .then((migrations) => {
                migrations.migrations.forEach(updateOrAddItem);
            })
            .catch((error) => {
                console.error('Failed to fetch CSV export migrations:', error);
            });

        const unsubscribe = sdk
            .forConsoleIn(page.params.region)
            .client.subscribe('console', (response) => {
                if (!response.channels.includes(`projects.${getProjectId()}`)) return;
                if (response.events.includes('migrations.*')) {
                    updateOrAddItem(response.payload as Payload);
                }
            });

        return unsubscribe;
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
                                            {@html text(
                                                value.status,
                                                value.table,
                                                value.bucketName ?? 'bucket'
                                            )}
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
