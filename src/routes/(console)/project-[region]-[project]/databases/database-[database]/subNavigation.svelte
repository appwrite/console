<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { showCreateTable, databaseSubNavigationItems } from './store';
    import type { PageData } from './$types';
    import { showSubNavigation } from '$lib/stores/layout';
    import {
        Icon,
        Sidebar,
        Navbar,
        Layout,
        Link,
        Typography,
        Divider
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

    let data = $derived(page.data) as PageData;

    let region = $derived(page.params.region);
    let project = $derived(page.params.project);
    let tableId = $derived(page.params.table);
    let databaseId = $derived(page.params.database);

    let openBottomSheet = $state(false);

    let tables = $state<Models.TableList>({
        total: 0,
        tables: []
    });

    const sortedTables = $derived.by(() => tables?.tables);

    const selectedTable = $derived.by(() =>
        sortedTables?.find((table: Models.Table) => table.$id === tableId)
    );

    const isTablesScreen = $derived(page.route.id.endsWith('table-[table]'));

    const isMainDatabaseScreen = $derived(page.route.id.endsWith('database-[database]'));

    async function loadTables() {
        tables = await sdk.forProject(region, project).tablesDB.listTables({
            databaseId: databaseId,
            queries: [Query.orderDesc(''), Query.limit(100)]
        });
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
            <div class="table-content">
                {#if tables?.total}
                    <ul class="drop-list u-margin-inline-start-8 u-margin-block-start-4">
                        {#each sortedTables as table, index}
                            {@const href = `${base}/project-${region}-${project}/databases/database-${databaseId}/table-${table.$id}`}
                            {@const isSelected = tableId === table.$id}
                            {@const isFirst = index === 0}
                            {@const isLast = index === sortedTables.length - 1}

                            <Layout.Stack gap="s" direction="row" alignItems="center">
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

            <Layout.Stack direction="column" gap="xxs" style="bottom: 1rem; position: sticky;">
                <div class="action-menu-divider">
                    <Divider />
                </div>

                <ul
                    style="margin-inline-start: -1.25rem"
                    class="drop-list bottom-nav u-margin-block-start-4">
                    {#each databaseSubNavigationItems as action}
                        {@const href = `${base}/project-${region}-${project}/databases/database-${databaseId}/${action.href}`}

                        <Layout.Stack gap="s" direction="row" alignItems="center">
                            <li>
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
            </Layout.Stack>
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
        padding-bottom: 16px;
        scrollbar-width: thin;
        scrollbar-color: var(--border-neutral, #ededf0) transparent;
        color: var(--fgcolor-neutral-secondary, #56565c);

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
        }

        li:hover {
            color: var(--fgcolor-neutral-primary);
            border-radius: var(--border-radius-s, 6px);
            background: var(--bgcolor-neutral-secondary);
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

    .action-menu-divider {
        margin-inline: -1.2rem;
        padding-block-end: 0.25rem;
    }
</style>
