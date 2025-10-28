<script lang="ts">
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { goto, invalidate } from '$app/navigation';
    import { getProjectId } from '$lib/helpers/project';
    import { addNotification } from '$lib/stores/notifications';
    import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { IconExclamationCircle } from '@appwrite.io/pink-icons-svelte';
    import { Modal, Code } from '$lib/components';
    import { type Models, type Payload, Query } from '@appwrite.io/console';

    // re-render the key for sheet UI.
    import { hash } from '$lib/helpers/string';
    import { spreadsheetRenderKey } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/store';
    import { Link } from '$lib/elements';

    type ImportItem = {
        status: string;
        table?: string;
        errors?: string[];
    };

    type ImportItemsMap = Map<string, ImportItem>;

    /**
     * Keeps a track of the active and ongoing csv migrations.
     *
     * The structure is as follows -
     * `{ migrationId: { status: status, table: table } }`
     */
    let importItems = $state<ImportItemsMap>(new Map());

    async function showCompletionNotification(database: string, table: string, payload: Payload) {
        const isSuccess = payload.status === 'completed';
        const isError = !isSuccess && !!payload.errors;

        if (!isSuccess && !isError) return;

        let errorMessage = 'Import failed. Check your CSV for correct fields and required values.';
        const errors = getErrors(payload);
        if (errors) {
            errorMessage = extractErrorMessage(errors);
        }

        const type = isSuccess ? 'success' : 'error';
        const message = isError ? errorMessage : 'CSV import finished successfully.';
        const url = `${base}/project-${page.params.region}-${page.params.project}/databases/database-${database}/table-${table}`;

        addNotification({
            type,
            message,
            isHtml: true,
            buttons:
                isSuccess && table !== page.params.table
                    ? [{ name: 'View rows', method: () => goto(url) }]
                    : undefined
        });

        if (isSuccess) {
            await invalidate(Dependencies.ROWS);
            spreadsheetRenderKey.set(hash(Date.now().toString()));
        }
    }

    async function updateOrAddItem(importData: Payload | Models.Migration) {
        if (importData.source.toLowerCase() !== 'csv') return;

        const status = importData.status;
        const resourceId = importData.resourceId ?? '';
        const [databaseId, tableId] = resourceId.split(':') ?? [];

        const current = importItems.get(importData.$id);
        let tableName = current?.table ?? null;

        if (!tableName && tableId) {
            try {
                const table = await sdk
                    .forProject(page.params.region, page.params.project)
                    .tablesDB.getTable({
                        databaseId,
                        tableId
                    });
                tableName = table.name;
            } catch {
                tableName = null;
            }
        }

        if (tableId && tableName === null) {
            const next = new Map(importItems);
            next.delete(importData.$id);
            importItems = next;
            return;
        }

        const existing = importItems.get(importData.$id);

        const isDone = (s: string) => s === 'completed' || s === 'failed';
        const isInProgress = (s: string) => ['pending', 'processing', 'uploading'].includes(s);

        const shouldSkip =
            (existing && isDone(existing.status) && isInProgress(status)) ||
            existing?.status === status;

        if (!shouldSkip) {
            const next = new Map(importItems);
            const errors = getErrors(importData);
            next.set(importData.$id, { status, table: tableName ?? undefined, errors });
            importItems = next;
        }

        if (status === 'completed' || status === 'failed') {
            await showCompletionNotification(databaseId, tableId, importData);
        }
    }

    function clear() {
        importItems = new Map();
    }

    function getErrors(importData: Payload | Models.Migration): string[] | undefined {
        return Array.isArray(importData.errors) ? importData.errors : undefined;
    }

    function parseError(error: string): unknown {
        try {
            return JSON.parse(error);
        } catch {
            return error;
        }
    }

    function extractErrorMessage(errors: string[]): string {
        try {
            return JSON.parse(errors[0]).message;
        } catch {
            return 'Import failed. Check your CSV for correct fields and required values.';
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
                return 30;
        }
    }

    function text(status: string, collectionName = '') {
        const name = collectionName ? `<b>${collectionName}</b>` : '';
        switch (status) {
            case 'completed':
                return `CSV import completed${name ? ` to ${name}` : ''}`;
            case 'failed':
                return `CSV import failed${name ? ` to ${name}` : ''}`;
            case 'processing':
                return `Importing CSV file${name ? ` to ${name}` : ''}`;
            default:
                return 'Preparing CSV for import...';
        }
    }

    onMount(() => {
        sdk.forProject(page.params.region, page.params.project)
            .migrations.list({
                queries: [
                    Query.equal('source', 'CSV'),
                    Query.equal('status', ['pending', 'processing'])
                ]
            })
            .then((migrations) => {
                migrations.migrations.forEach(updateOrAddItem);
            });

        return sdk.forConsoleIn(page.params.region).client.subscribe('console', (response) => {
            if (!response.channels.includes(`projects.${getProjectId()}`)) return;
            if (response.events.includes('migrations.*')) {
                updateOrAddItem(response.payload as Payload);
            }
        });
    });

    let isOpen = $state(true);
    let showCsvImportBox = $derived(importItems.size > 0);

    let showDetails = $state(false);
    let selectedErrors = $state<string[]>([]);
    let parsedErrors = $state<unknown[]>([]);

    function openDetails(errors: string[] | undefined) {
        selectedErrors = errors ?? [];
        parsedErrors = selectedErrors.map(parseError);
        showDetails = true;
    }
</script>

{#if showCsvImportBox}
    <Layout.Stack direction="column" gap="l" alignItems="flex-end">
        <section class="upload-box">
            <header class="upload-box-header">
                <h4 class="upload-box-title">
                    <Typography.Text variant="m-500">
                        Importing rows ({importItems.size})
                    </Typography.Text>
                </h4>
                <button
                    class="upload-box-button"
                    class:is-open={isOpen}
                    aria-label="toggle upload box"
                    onclick={() => (isOpen = !isOpen)}>
                    <span class="icon-cheveron-up" aria-hidden="true"></span>
                </button>
                <button
                    class="upload-box-button"
                    aria-label="close CSV import box"
                    onclick={clear}>
                    <span class="icon-x" aria-hidden="true"></span>
                </button>
            </header>

            <div class="upload-box-content-list">
                {#each [...importItems.entries()] as [key, value] (key)}
                    <div class="upload-box-content" class:is-open={isOpen}>
                        <ul class="upload-box-list">
                            <li class="upload-box-item">
                                <section class="progress-bar u-width-full-line">
                                    <div
                                        class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                        <Typography.Text>
                                            {@html text(value.status, value.table)}
                                        </Typography.Text>
                                    </div>
                                    <div
                                        class="progress-bar-container"
                                        class:is-danger={value.status === 'failed'}
                                        style="--graph-size:{graphSize(value.status)}%">
                                    </div>
                                    {#if value.status === 'failed'}
                                        <Layout.Stack
                                            direction="row"
                                            gap="xs"
                                            alignItems="center"
                                            inline>
                                            <Icon
                                                icon={IconExclamationCircle}
                                                color="--fgcolor-error"
                                                size="s" />
                                            <Typography.Text color="--fgcolor-error">
                                                There was an import issue.
                                                <Link
                                                    style="color: inherit"
                                                    onclick={() => openDetails(value.errors)}
                                                    >View details</Link>
                                            </Typography.Text>
                                        </Layout.Stack>
                                    {/if}
                                </section>
                            </li>
                        </ul>
                    </div>
                {/each}
            </div>
        </section>
    </Layout.Stack>
{/if}

<Modal title="Import error" bind:show={showDetails} hideFooter>
    <Layout.Stack gap="m">
        <Layout.Stack>
            <Code
                language="json"
                code={JSON.stringify(parsedErrors, null, 2)}
                withCopy
                allowScroll />
        </Layout.Stack>
    </Layout.Stack>
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
        width: 324px;
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
