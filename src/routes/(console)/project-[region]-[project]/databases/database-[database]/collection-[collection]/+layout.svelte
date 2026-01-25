<script lang="ts" context="module">
    import { writable } from 'svelte/store';
    import { ID } from '@appwrite.io/console';
    import { toLocaleDateTime } from '$lib/helpers/date';

    const showCreateIndex = writable(false);
    export const initCreateIndex = () => {
        showCreateIndex.set(true);
    };

    export function buildInitDoc() {
        const now = new Date().toISOString();
        return {
            $id: ID.unique(),
            $createdAt: toLocaleDateTime(now),
            $updatedAt: toLocaleDateTime(now)
        };
    }
</script>

<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { realtime, sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { page } from '$app/state';
    import { canWriteTables } from '$lib/stores/roles';
    import { IconLockClosed, IconPlus, IconPuzzle } from '@appwrite.io/pink-icons-svelte';
    import { preferences } from '$lib/stores/preferences';

    import {
        expandTabs,
        randomDataModalState,
        spreadsheetRenderKey,
        spreadsheetLoading
    } from '$database/store';
    import type { LayoutData } from './$types';
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import { generateFakeRecords } from '$lib/helpers/faker';
    import { addNotification } from '$lib/stores/notifications';
    import { sleep } from '$lib/helpers/promises';
    import { hash } from '$lib/helpers/string';
    import {
        documentActivitySheet,
        documentPermissionSheet,
        noSqlDocument
    } from '$database/collection-[collection]/store';
    import {
        SideSheet,
        EditRecordPermissions,
        RecordActivity,
        type Field
    } from '$database/(entity)';
    import {
        entityColumnSuggestions,
        type ColumnInput,
        mapSuggestedColumns,
        mockSuggestions
    } from '$database/(suggestions)';
    import { VARS } from '$lib/system';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let data: LayoutData;

    /**
     * adding a lot of fake data will trigger the realtime below
     * and will keep invalidating the `Dependencies.COLLECTION` making a lot of API noise!
     */
    let isWaterfallFromFaker = false;

    let editRecordPermissions: EditRecordPermissions;

    $: collection = data.collection;
    $: basePath = resolveRoute(
        '/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]',
        page.params
    );

    onMount(() => {
        expandTabs.set(preferences.getKey('entityHeaderExpanded', true));

        // set faker method.
        $randomDataModalState.onSubmit = async () => await createFakeData();

        if (
            $entityColumnSuggestions.enabled &&
            $entityColumnSuggestions.thinking &&
            $entityColumnSuggestions.entity?.id === collection.$id
        ) {
            createSampleDocuments();
        }

        return realtime.forProject(page.params.region, ['project', 'console'], (response) => {
            if (response.events.includes('documentsdb.*.collections.*.indexes.*')) {
                if (!isWaterfallFromFaker && !$entityColumnSuggestions.entity) {
                    invalidate(Dependencies.COLLECTION);
                }
            }
        });
    });

    // TODO: use route ids instead of pathname
    $: $registerCommands([
        {
            label: 'Create documents',
            keys: page.url.pathname.endsWith(collection?.$id) ? ['d'] : ['d', 'c'],
            callback: () => {
                noSqlDocument.create(buildInitDoc());
            },
            icon: IconPlus,
            group: 'documents'
        },
        {
            label: 'Go to documents',
            keys: ['g', 'd'],
            callback() {
                goto(basePath);
            },
            disabled: page.url.pathname.endsWith(collection?.$id),
            group: 'collections'
        },
        {
            label: 'Go to indexes',
            keys: ['g', 'i'],
            callback() {
                goto(withPath(basePath, '/indexes'));
            },
            disabled: page.url.pathname.endsWith('indexes'),
            group: 'collections'
        },
        {
            label: 'Go to activity',
            keys: ['g', 'c'],
            callback() {
                goto(withPath(basePath, '/activity'));
            },
            disabled: page.url.pathname.endsWith('activity'),
            group: 'collections'
        },
        {
            label: 'Go to usage',
            keys: ['g', 'u'],
            callback() {
                goto(withPath(basePath, '/usage'));
            },
            disabled: page.url.pathname.endsWith('usage'),
            group: 'collections'
        },
        {
            label: 'Go to settings',
            keys: ['g', 's'],
            callback() {
                goto(withPath(basePath, '/settings'));
            },
            disabled: page.url.pathname.endsWith('settings') || !$canWriteTables,
            group: 'collections'
        },
        {
            label: 'Permissions',
            callback() {
                goto(withPath(basePath, '/settings#permissions'));
            },
            group: 'collections',
            disabled:
                page.url.pathname.endsWith('permissions') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteTables,
            icon: IconPuzzle
        },
        {
            label: 'Row security',
            callback() {
                goto(withPath(basePath, '/settings#row-security'));
            },
            group: 'collections',
            disabled:
                page.url.pathname.endsWith('row-security') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteTables,
            icon: IconLockClosed
        },
        {
            label: 'Create index',
            keys: page.url.pathname.endsWith('indexes') ? ['c'] : ['c', 'i'],
            callback() {
                initCreateIndex();
            },
            icon: IconPlus,
            group: 'indexes',
            disabled: !$canWriteTables
        }
    ]);

    $updateCommandGroupRanks({
        documents: 900,
        collections: 800,
        indexes: 700
    });

    async function createSampleDocuments() {
        $spreadsheetLoading = true;
        isWaterfallFromFaker = true;

        let documentIds = [];
        let suggestedColumns: { total: number; columns: ColumnInput[] } = {
            total: 0,
            columns: []
        };

        try {
            if (VARS.MOCK_AI_SUGGESTIONS) {
                await sleep(1250);
                suggestedColumns = mockSuggestions;
            } else {
                suggestedColumns = (await sdk
                    .forProject(page.params.region, page.params.project)
                    .console.suggestColumns({
                        databaseId: page.params.database,
                        tableId: page.params.collection,
                        context: $entityColumnSuggestions.context ?? undefined,
                        min: 6
                    })) as unknown as {
                    total: number;
                    columns: ColumnInput[];
                };
            }

            const collectionName = $entityColumnSuggestions.entity?.name ?? undefined;
            trackEvent(Submit.ColumnSuggestions, {
                collectionName,
                total: suggestedColumns.total
            });

            const mappedColumns = mapSuggestedColumns(suggestedColumns.columns);
            const fields = mappedColumns.map((col) => ({
                key: col.key,
                type: col.type,
                required: col.required,
                array: col.array,
                size: col.size,
                min: col.min,
                max: col.max,
                format: col.format,
                elements: col.elements,
                status: 'available'
            })) as Field[];

            const { rows, ids } = generateFakeRecords($randomDataModalState.value, fields);
            documentIds = ids;

            await sdk
                .forProject(page.params.region, page.params.project)
                .documentsDB.createDocuments({
                    databaseId: page.params.database,
                    collectionId: page.params.collection,
                    documents: rows
                });

            addNotification({
                type: 'success',
                message: 'Sample data added successfully with AI-suggested attributes'
            });

            await invalidate(Dependencies.DOCUMENTS);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.ColumnSuggestions);
        } finally {
            // Reset suggestion state
            entityColumnSuggestions.update((store) => ({
                ...store,
                thinking: false,
                entity: null
            }));

            $spreadsheetLoading = false;
            isWaterfallFromFaker = false;
        }

        spreadsheetRenderKey.set(hash(documentIds));
    }

    async function createFakeData() {
        isWaterfallFromFaker = true;

        $spreadsheetLoading = true;
        $randomDataModalState.show = false;

        /* let the columns be processed! */
        await sleep(1250);

        let documentIds = [];
        try {
            const { rows, ids } = generateFakeRecords($randomDataModalState.value);

            documentIds = ids;

            await sdk
                .forProject(page.params.region, page.params.project)
                .documentsDB.createDocuments({
                    databaseId: page.params.database,
                    collectionId: page.params.collection,
                    documents: rows
                });

            addNotification({
                type: 'success',
                message: 'Sample data added successfully'
            });

            await invalidate(Dependencies.DOCUMENTS);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        } finally {
            // reset value to 25 default!
            $randomDataModalState.value = 25;
        }

        $spreadsheetLoading = false;
        isWaterfallFromFaker = false;

        spreadsheetRenderKey.set(hash(documentIds));
    }
</script>

<svelte:head>
    <title>{collection?.name ?? 'Collection'} - Appwrite</title>
</svelte:head>

<slot />

<SideSheet
    closeOnBlur
    title="Document permissions"
    bind:show={$documentPermissionSheet.show}
    submit={{
        text: 'Update',
        disabled: editRecordPermissions?.disableSubmit(),
        onClick: async () => editRecordPermissions?.updatePermissions()
    }}>
    <EditRecordPermissions
        entity={collection}
        bind:this={editRecordPermissions}
        bind:record={$documentPermissionSheet.document} />
</SideSheet>

<SideSheet title="Document activity" bind:show={$documentActivitySheet.show} closeOnBlur>
    <RecordActivity record={$documentActivitySheet.document} />
</SideSheet>
