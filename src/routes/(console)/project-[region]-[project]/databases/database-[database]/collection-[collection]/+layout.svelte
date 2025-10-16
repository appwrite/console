<script lang="ts" context="module">
    import { writable } from 'svelte/store';

    const showCreateIndex = writable(false);
    export const initCreateIndex = () => {
        showCreateIndex.set(true);
    };
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

    import { expandTabs, randomDataModalState } from '../store';
    import type { LayoutData } from './$types';
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import { generateFakeRecords } from '$lib/helpers/faker';
    import { addNotification } from '$lib/stores/notifications';
    import { sleep } from '$lib/helpers/promises';
    import { hash } from '$lib/helpers/string';
    import { spreadsheetLoading, spreadsheetRenderKey } from './store';

    export let data: LayoutData;

    /**
     * adding a lot of fake data will trigger the realtime below
     * and will keep invalidating the `Dependencies.COLLECTION` making a lot of API noise!
     */
    let isWaterfallFromFaker = false;

    $: collection = data.collection;
    $: basePath = resolveRoute(
        '/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]',
        page.params
    );

    onMount(() => {
        expandTabs.set(preferences.getKey('entityHeaderExpanded', true));

        // set faker method.
        $randomDataModalState.onSubmit = async () => await createFakeData();

        return realtime
            .forProject(page.params.region, page.params.project)
            .subscribe(['project', 'console'], (response) => {
                if (response.events.includes('databases.*.collections.*.indexes.*')) {
                    // don't invalidate when -
                    // 1. from faker
                    // 2. ai indexes creation
                    // 3. ai columns creation
                    if (
                        !isWaterfallFromFaker /*&&
                        !$showIndexesSuggestions &&
                        !$tableColumnSuggestions.table*/
                    ) {
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
                // TODO: later
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

    async function createFakeData() {
        isWaterfallFromFaker = true;

        $spreadsheetLoading = true;
        $randomDataModalState.show = false;

        /* let the columns be processed! */
        await sleep(1250);

        let documentIds = [];
        try {
            const { records, ids } = generateFakeRecords(
                $randomDataModalState.value,
                'documentsdb'
            );

            documentIds = ids;

            await sdk
                .forProject(page.params.region, page.params.project)
                .documentsDB.createDocuments({
                    databaseId: page.params.database,
                    collectionId: page.params.collection,
                    documents: records
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
