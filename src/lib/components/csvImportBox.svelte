<script lang="ts">
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { goto, invalidate } from '$app/navigation';
    import { getProjectId } from '$lib/helpers/project';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { writable, type Writable } from 'svelte/store';
    import { addNotification } from '$lib/stores/notifications';
    import { type Models, type Payload, Query } from '@appwrite.io/console';

    type ImportItem = {
        status: string;
        collection?: string;
    };

    type ImportItemsMap = Map<string, ImportItem>;

    /**
     * Keeps a track of the active and ongoing csv migrations.
     *
     * The structure is as follows -
     * `{ migrationId: { status: status, collection: collection } }`
     */
    const importItems: Writable<ImportItemsMap> = writable(new Map());

    async function showCompletionNotification(databaseId: string, collectionId: string) {
        const projectId = page.params.project;
        await invalidate(Dependencies.DOCUMENTS);
        const url = `${base}/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}`;

        addNotification({
            type: 'success',
            isHtml: true,
            message: `CSV import finished successfully.`,
            buttons:
                collectionId === page.params.collection
                    ? undefined
                    : [
                          {
                              name: 'View documents',
                              method: () => goto(url)
                          }
                      ]
        });
    }

    async function updateOrAddItem(importData: Payload | Models.Migration) {
        if (importData.source.toLowerCase() !== 'csv') return;

        const status = importData.status;
        const resourceId = importData.resourceId ?? '';
        const [databaseId, collectionId] = resourceId.split(':') ?? [];

        const current = $importItems.get(importData.$id);
        let collectionName = current?.collection ?? null;

        if (!collectionName && collectionId) {
            try {
                const collection = await sdk.forProject.databases.getCollection(
                    databaseId,
                    collectionId
                );
                collectionName = collection.name;
            } catch {
                collectionName = null;
            }
        }

        importItems.update((items) => {
            const existing = items.get(importData.$id);

            const isDone = (s: string) => s === 'completed' || s === 'failed';
            const isInProgress = (s: string) => ['pending', 'processing', 'uploading'].includes(s);

            const shouldSkip =
                (existing && isDone(existing.status) && isInProgress(status)) ||
                existing?.status === status;

            if (shouldSkip) return items;

            const next = new Map(items);
            next.set(importData.$id, { status, collection: collectionName ?? undefined });
            return next;
        });

        if (status === 'completed') {
            await showCompletionNotification(databaseId, collectionId);
        }
    }

    function clear() {
        importItems.update((items) => {
            items.clear();
            return items;
        });
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

    function text(status: string) {
        if (status === 'completed') {
            return 'CSV import complete';
        } else if (status === 'failed') {
            return 'CSV import failed';
        } else {
            return 'Preparing CSV for import...';
        }
    }

    onMount(() => {
        sdk.forProject.migrations
            .list([Query.equal('source', 'CSV'), Query.equal('status', ['pending', 'processing'])])
            .then((migrations) => {
                migrations.migrations.forEach(updateOrAddItem);
            });

        return sdk.forConsole.client.subscribe('console', (response) => {
            if (!response.channels.includes(`projects.${getProjectId()}`)) return;
            if (response.events.includes('migrations.*')) {
                updateOrAddItem(response.payload as Payload);
            }
        });
    });

    $: isOpen = true;
    $: showCsvImportBox = $importItems.size > 0;
</script>

{#if showCsvImportBox}
    <div class="box-holder u-flex u-flex-vertical u-gap-16" style="align-items: end">
        <section class="upload-box">
            <header class="upload-box-header">
                <h4 class="upload-box-title">
                    <Typography.Text variant="m-500">
                        Importing documents ({$importItems.size})
                    </Typography.Text>
                </h4>
                <button
                    class="upload-box-button"
                    class:is-open={isOpen}
                    aria-label="toggle upload box"
                    on:click={() => {
                        isOpen = !isOpen;
                    }}>
                    <span class="icon-cheveron-up" aria-hidden="true"></span>
                </button>
                <button
                    class="upload-box-button"
                    aria-label="close backup restore box"
                    on:click={clear}>
                    <span class="icon-x" aria-hidden="true"></span>
                </button>
            </header>

            {#each [...$importItems.entries()] as [key, value] (key)}
                <div class="upload-box-content" class:is-open={isOpen}>
                    <ul class="upload-box-list">
                        <li class="upload-box-item">
                            <section class="progress-bar u-width-full-line">
                                <div
                                    class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                    <Typography.Text>
                                        {text(value.status)}
                                    </Typography.Text>

                                    {#if value.collection}
                                        <Typography.Caption variant="400">
                                            {value.collection}
                                        </Typography.Caption>
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
        </section>
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
