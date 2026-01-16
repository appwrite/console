<script lang="ts">
    import { base } from '$app/paths';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import { showSubNavigation } from '$lib/stores/layout';
    import { bannerSpacing } from '$lib/layout/headerAlert.svelte';
    import { showCreateTable, databaseSubNavigationItems } from './store';

    import {
        Icon,
        Sidebar,
        Navbar,
        Layout,
        Link,
        Typography,
        Divider,
        Skeleton
    } from '@appwrite.io/pink-svelte';
    import {
        IconChevronDown,
        IconDatabase,
        IconPlus,
        IconTable
    } from '@appwrite.io/pink-icons-svelte';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { BottomSheet } from '$lib/components';
    import Button from '$lib/elements/forms/button.svelte';
    import { type Models, Query } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { subNavigation } from '$lib/stores/database';
    import TableContextMenu, { type TableAction } from './tableContextMenu.svelte';
    import CopySnippetModal from '$lib/components/copySnippetModal.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { trackEvent, trackError, Submit } from '$lib/actions/analytics';
    import { isCsvImportInProgress } from './table-[table]/store';
    import FilePicker from '$lib/components/filePicker.svelte';

    import { preferences } from '$lib/stores/preferences';

    const data = $derived(page.data) as PageData;

    const region = $derived(page.params.region);
    const project = $derived(page.params.project);
    const tableId = $derived(page.params.table);
    const databaseId = $derived(page.params.database);

    let openBottomSheet = $state(false);
    let loading = $state(true);

    let tables = $state<Models.TableList>({
        total: 0,
        tables: []
    });

    const pinnedTablesKey = $derived(`pinned_tables_${databaseId}`);
    const pinnedTableIds = $derived(
        ($preferences.miscellaneous?.[pinnedTablesKey]?.toString()?.split(',') ?? []).filter(
            Boolean
        )
    );

    const sortedTables = $derived.by(() => {
        return tables?.tables?.slice().sort((a, b) => {
            const aPinned = pinnedTableIds.includes(a.$id);
            const bPinned = pinnedTableIds.includes(b.$id);

            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;

            return a.name.localeCompare(b.name);
        });
    });

    const selectedTable = $derived.by(() =>
        sortedTables?.find((table: Models.Table) => table.$id === tableId)
    );

    const isTablesScreen = $derived(page.route.id.endsWith('table-[table]'));

    const isMainDatabaseScreen = $derived(page.route.id.endsWith('database-[database]'));

    // If banner open, adjust bottom position to account for banner container.
    // 70.5px is the size of the container of the banner holder and not just the banner!
    // Needed because things vary a bit much on how different browsers treat bottom layouts.
    const bottomNavOffset = $derived($bannerSpacing ? '70.5px' : '0px');
    const tableContentPadding = $derived($bannerSpacing ? '210px' : '140px');

    async function loadTables() {
        try {
            tables = await sdk.forProject(region, project).tablesDB.listTables({
                databaseId: databaseId,
                queries: [Query.orderDesc(''), Query.limit(100)]
            });
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadTables();
        return subNavigation.subscribe(loadTables);
    });

    function onResize() {
        if (openBottomSheet && !$isTabletViewport) {
            openBottomSheet = false;
        }
    }

    let showCopySnippetModal = $state(false);
    let showImportCSV = $state(false);
    let selectedTableForAction = $state<Models.Table | null>(null);

    async function onSelectFile(file: Models.File, localFile = false) {
        if (!selectedTableForAction) return;

        $isCsvImportInProgress = true;

        try {
            await sdk.forProject(region, project).migrations.createCSVImport({
                bucketId: file.bucketId,
                fileId: file.$id,
                resourceId: `${databaseId}:${selectedTableForAction.$id}`,
                internalFile: localFile
            });

            addNotification({
                type: 'success',
                message: 'Rows import from csv has started'
            });

            trackEvent(Submit.DatabaseImportCsv);
        } catch (e) {
            trackError(e, Submit.DatabaseImportCsv);
            addNotification({
                type: 'error',
                message: e.message
            });
        } finally {
            $isCsvImportInProgress = false;
        }
    }

    async function handleTableAction(action: TableAction, table: Models.Table) {
        selectedTableForAction = table;
        switch (action) {
            case 'copy-snippet':
                showCopySnippetModal = true;
                break;
            case 'upload-csv':
                showImportCSV = true;
                break;
            case 'copy-url':
                await navigator.clipboard.writeText(
                    `${window.location.origin}${base}/project-${region}-${project}/databases/database-${databaseId}/table-${table.$id}`
                );
                addNotification({
                    type: 'success',
                    message: 'URL copied to clipboard'
                });
                break;
            case 'copy-json':
                await navigator.clipboard.writeText(JSON.stringify(table, null, 2));
                addNotification({
                    type: 'success',
                    message: 'JSON copied to clipboard'
                });
                break;
            case 'pin': {
                const isPinned = pinnedTableIds.includes(table.$id);
                const newPinnedIds = isPinned
                    ? pinnedTableIds.filter((id) => id !== table.$id)
                    : [...pinnedTableIds, table.$id];
                await preferences.setKey(pinnedTablesKey, newPinnedIds.join(','));
                addNotification({
                    type: 'success',
                    message: `Table ${isPinned ? 'unpinned' : 'pinned'}`
                });
                break;
            }
            case 'permissions':
                await goto(
                    `${base}/project-${region}-${project}/databases/database-${databaseId}/table-${table.$id}/settings`
                );
                break;
            case 'delete':
                break;
            default:
                break;
        }
    }
</script>

<svelte:window on:resize={onResize} />

{#if !$isTabletViewport}
    <Sidebar.Base state="open" resizable={false}>
        <section class="list-container" slot="top" style:width="100%">
            <a
                class:is-selected={!isTablesScreen}
                href={`${base}/project-${region}-${project}/databases/database-${databaseId}`}
                class="database-name u-flex u-cross-center body-text-2 u-gap-8 is-not-mobile u-padding-block-8 u-padding-inline-start-4">
                <Icon icon={IconDatabase} size="s" color="--fgcolor-neutral-weak" />

                {data.database?.name}
            </a>
            <div class="table-content" style:padding-bottom={tableContentPadding}>
                {#if loading}
                    <ul class="drop-list u-margin-inline-start-8 u-margin-block-start-4">
                        {#each Array(2) as _}
                            <Layout.Stack gap="s" direction="row" alignItems="center">
                                <li>
                                    <div
                                        class="u-padding-block-8 u-padding-inline-end-4 u-padding-inline-start-8 u-flex u-cross-center u-gap-8">
                                        <Skeleton variant="line" width="70%" height={19} />
                                    </div>
                                </li>
                            </Layout.Stack>
                        {/each}
                    </ul>
                {:else if tables?.total}
                    <ul class="drop-list u-margin-inline-start-8 u-margin-block-start-4">
                        {#each sortedTables as table, index}
                            {@const href = `${base}/project-${region}-${project}/databases/database-${databaseId}/table-${table.$id}`}
                            {@const isSelected = tableId === table.$id}
                            {@const isFirst = index === 0}
                            {@const isLast = index === sortedTables.length - 1}

                            <Layout.Stack gap="s" direction="row" alignItems="center">
                                <TableContextMenu
                                    onSelect={(action) => handleTableAction(action, table)}
                                    isPinned={pinnedTableIds.includes(table.$id)}>
                                    <li
                                        class:is-last={isLast}
                                        class:is-first={isFirst}
                                        class:is-selected={isSelected}>
                                        <a
                                            class="u-padding-block-8 u-padding-inline-end-4 u-padding-inline-start-8 u-flex u-cross-center u-gap-8"
                                            {href}>
                                            <Icon
                                                icon={IconTable}
                                                size="s"
                                                color={isSelected
                                                    ? '--fgcolor-neutral-tertiary'
                                                    : '--fgcolor-neutral-weak'} />
                                            <span class="text table-name" data-private
                                                >{table.name}</span>
                                        </a>
                                    </li>
                                </TableContextMenu>
                            </Layout.Stack>
                        {/each}
                    </ul>
                {:else}
                    <div style:padding-block="0.75rem">
                        <Layout.Stack
                            gap="m"
                            direction="row"
                            alignItems="center"
                            class="u-margin-inline-start-8 u-margin-block-start-8">
                            <div
                                style:border-left="1px solid var(--border-neutral, #ededf0)"
                                style:height="1rem">
                            </div>
                            No tables yet
                        </Layout.Stack>
                    </div>
                {/if}

                <Layout.Stack
                    alignItems="center"
                    direction="row"
                    style="gap: 3px; margin-block-start: 8px;">
                    <Icon icon={IconPlus} size="s" />
                    <Button
                        compact
                        on:click={() => {
                            $showCreateTable = true;
                            $showSubNavigation = false;
                        }}>
                        Create table
                    </Button>
                </Layout.Stack>
            </div>

            <div class="bottom-nav-container" style:bottom={bottomNavOffset}>
                <div class="action-menu-divider">
                    <Divider />
                </div>

                <ul
                    style="margin-inline-start: -1.25rem"
                    class="drop-list bottom-nav u-margin-block-start-4">
                    {#each databaseSubNavigationItems as action}
                        {@const href = `${base}/project-${region}-${project}/databases/database-${databaseId}/${action.href}`}

                        <Layout.Stack gap="s" direction="row" alignItems="center">
                            <li class="bottom-nav-item">
                                <a
                                    {href}
                                    class="u-padding-block-8 u-padding-inline-end-4 u-padding-inline-start-8 u-flex u-cross-center u-gap-8">
                                    <Icon
                                        size="s"
                                        icon={action.icon}
                                        color="--fgcolor-neutral-weak" />
                                    <span class="text table-name">{action.title}</span>
                                </a>
                            </li>
                        </Layout.Stack>
                    {/each}
                </ul>
            </div>
        </section>
    </Sidebar.Base>
{:else if data?.database?.name && !isMainDatabaseScreen}
    <Navbar.Base>
        <div slot="left">
            <Layout.Stack direction="row" alignItems="center" gap="s">
                <Icon icon={IconDatabase} size="s" color="--neutral-300" />
                <Link.Anchor
                    href={`${base}/project-${region}-${project}/databases/database-${databaseId}`}
                    variant="quiet-muted">
                    {data.database.name}
                </Link.Anchor>

                <span style:margin-left="8px">/</span>

                <Button text extraCompact on:click={() => (openBottomSheet = !openBottomSheet)}>
                    <Typography.Text variant="m-400">
                        {selectedTable?.name}
                    </Typography.Text>
                    <Icon icon={IconChevronDown} size="s" />
                </Button>
            </Layout.Stack>
        </div>
    </Navbar.Base>
{/if}
{#if openBottomSheet}
    <BottomSheet.Menu
        bind:isOpen={openBottomSheet}
        menu={{
            top: {
                items: sortedTables.slice(0, 10).map((table) => {
                    return {
                        name: table.name,
                        leadingIcon: IconTable,
                        href: `${base}/project-${region}-${project}/databases/database-${databaseId}/table-${table.$id}`
                    };
                })
            },
            bottom:
                sortedTables.length > 10
                    ? {
                          items: [
                              {
                                  name: 'All tables',
                                  leadingIcon: IconTable,
                                  href: `${base}/project-${region}-${project}/databases/database-${databaseId}`
                              }
                          ]
                      }
                    : undefined
        }}></BottomSheet.Menu>
{/if}

<CopySnippetModal
    bind:show={showCopySnippetModal}
    row={null}
    {databaseId}
    collectionId={selectedTableForAction?.$id ?? ''} />

{#if showImportCSV}
    <FilePicker
        onSelect={onSelectFile}
        showLocalFileBucket
        localFileBucketTitle="Upload CSV file"
        mimeTypeQuery="text/"
        allowedExtension="csv"
        bind:show={showImportCSV}
        gridImageDimensions={{
            imageHeight: 32,
            imageWidth: 32
        }} />
{/if}

<style lang="scss">
    .list-container {
        height: 100%;
        display: flex;
        min-height: 0;
        flex-direction: column;
    }

    .database-name {
        margin-block-end: 4px;
        font-size: var(--font-size-sm);
        color: var(--fgcolor-neutral-secondary);

        &:hover {
            color: var(--fgcolor-neutral-primary);
            border-radius: var(--border-radius-s, 6px);
            background: var(--bgcolor-neutral-secondary);
        }
    }

    .table-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;
        margin-bottom: auto;
        color: var(--fgcolor-neutral-secondary, #56565c);

        /* hide scrollbars */
        scrollbar-width: none;
        -ms-overflow-style: none;

        // scrollbar-width: thin;
        // scrollbar-color: var(--border-neutral, #ededf0) transparent;

        &::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 2px;
        }

        &::-webkit-scrollbar-thumb {
            background: var(--border-neutral, #ededf0);
            border-radius: 2px;

            &:hover {
                background: var(--border-neutral-emphasis, #dbdbdf);
            }
        }
    }

    .drop-list {
        flex: 1;
        gap: 4px;
        padding-left: 4px;
        position: relative;
        font-size: var(--font-size-sm);
        color: var(--fgcolor-neutral-secondary);

        &::-webkit-scrollbar {
            display: none;
        }

        &:not(.bottom-nav)::before {
            content: '';
            right: 99%;
            top: 0.2rem;
            bottom: 0.2rem;
            position: absolute;
            border-left: 1px solid var(--border-neutral, #ededf0);
        }

        // first item
        &:not(.bottom-nav):has(li.is-first)::before {
            top: 0.8rem;
        }

        // last item
        &:not(.bottom-nav):has(li.is-last)::before {
            bottom: 0.85rem;
        }

        // the only item
        &:not(.bottom-nav):has(li.is-first.is-last)::before {
            top: 0.6rem;
            bottom: 0.6rem;
        }

        li {
            width: 100%;
            overflow: hidden;
            position: relative;
            padding-inline-end: 0.5rem;
            margin-inline-start: 0.5rem;

            &:hover {
                color: var(--fgcolor-neutral-primary);
                border-radius: var(--border-radius-s, 6px);
                background: var(--bgcolor-neutral-secondary);
            }

            &.bottom-nav-item:hover {
                margin-inline-end: 1.25rem;
            }
        }

        .table-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-clamp: 1;
            color: var(--fgcolor-neutral-secondary, #56565c);
        }
    }

    .is-selected {
        color: var(--fgcolor-neutral-primary);
        border-radius: var(--border-radius-s, 6px);
        background: var(--bgcolor-neutral-secondary);
    }

    :global(.sub-navigation header) {
        top: 48px !important;
    }

    :global(.trigger) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-1, 2px) var(--space-2, 4px) var(--space-1, 2px) var(--space-3, 6px);
        gap: var(--space-2, 4px);
        transition: color 0.2s ease;

        color: var(--fgcolor-neutral-secondary);
        border-radius: var(--corner-radius-medium, 8px);

        cursor: default;
        /* Body text/level 2 Regular */
        font-family: Inter;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 21px */
    }

    .bottom-nav-container {
        right: 0;
        bottom: 0;
        left: 1.25rem;
        position: absolute;
        padding-block-end: 1rem;
        z-index: 1;
        background: var(--bgcolor-neutral-primary);
    }

    .action-menu-divider {
        padding-block-end: 0.25rem;
        margin-inline-start: -1.25rem;
    }
</style>
