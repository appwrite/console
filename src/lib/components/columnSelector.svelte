<script lang="ts">
    import { page } from '$app/state';
    import type { Writable } from 'svelte/store';
    import { preferences } from '$lib/stores/preferences';
    import { onMount, type Snippet } from 'svelte';
    import type { Column } from '$lib/helpers/types';
    import { ActionMenu, Divider, Layout, Popover, Selector } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';

    let {
        columns,
        isCustomTable = false,
        ui = 'legacy',
        allowNoColumns = false,
        showAnyway = false,
        children
    }: {
        columns: Writable<Column[]>;
        isCustomTable?: boolean;
        allowNoColumns?: boolean;
        ui?: 'legacy' | 'new';
        showAnyway?: boolean;
        children: Snippet<[toggle: () => void, selectedColumnsNumber: number]>;
    } = $props();

    let search = $state('');
    let filteredColumns = $derived(
        $columns
            .filter((column) => !column.isAction && column.id !== '$sequence')
            .filter(
                (col) =>
                    !col.exclude &&
                    (col.title?.toLowerCase().includes(search.toLowerCase()) ||
                        col.id?.toLowerCase().includes(search.toLowerCase()))
            )
    );

    let maxHeight = $state('none');
    let containerRef = $state<HTMLElement>(null);
    const isNewStyle = ui === 'new';

    const calcMaxHeight = () => {
        if (containerRef) {
            // get parent row element for correct top position
            const parent = containerRef?.parentElement?.parentElement;
            const { top } = parent.getBoundingClientRect();

            maxHeight = `${window.innerHeight - top - 48}px`;
        }
    };

    const saveColumnPreferences = () => {
        const shownColumns = $columns.filter((n) => n.hide === true).map((n) => n.id);

        if (isCustomTable) {
            preferences.setCustomTableColumns(page.params.table, shownColumns);
        } else {
            preferences.setColumns(shownColumns);
        }
    };

    onMount(() => {
        if (isCustomTable) {
            const shownColumns = preferences.getCustomTableColumns(page.params.table);

            columns.update((n) =>
                n.map((column) => {
                    column.hide = shownColumns?.includes(column.id) ?? false;
                    return column;
                })
            );
        } else {
            const prefs = preferences.get(page.route);

            if (prefs?.columns) {
                columns.update((n) =>
                    n.map((column) => {
                        column.hide = prefs.columns?.includes(column.id) ?? false;
                        return column;
                    })
                );
            }
        }

        calcMaxHeight();
    });

    let selectedColumnsNumber = $derived(
        $columns.reduce((acc, column) => {
            if (column.hide) return acc;

            return ++acc;
        }, 0)
    );

    function toggleColumn(column: Column) {
        columns.update((cols) =>
            cols.map((col) => (col.id === column.id ? { ...col, hide: !col.hide } : col))
        );
        saveColumnPreferences();
    }

    function selectAll() {
        columns.update((cols) =>
            cols.map((col) =>
                col.exclude
                    ? col
                    : filteredColumns.some((fc) => fc.id === col.id)
                      ? { ...col, hide: false }
                      : col
            )
        );
        saveColumnPreferences();
    }

    function deselectAll() {
        columns.update((cols) => {
            const realColumns = cols.filter((col) => !col.exclude && !col.isAction);
            const filtered = filteredColumns.filter((col) => !col.exclude && !col.isAction);

            if (filtered.length === 0) return cols;

            const visibleRealColumns = realColumns.filter((col) => !col.hide);

            if (!allowNoColumns && visibleRealColumns.length <= 1) {
                return cols;
            }

            const willHideCount = filtered.filter((col) => !col.hide).length;

            if (!allowNoColumns && visibleRealColumns.length - willHideCount < 1) {
                const [keep] = filtered;
                return cols.map((col) => {
                    if (col.exclude || col.isAction) return col;
                    if (!filtered.some((fc) => fc.id === col.id)) return col;

                    if (col.id === keep.id) {
                        const stillVisible = cols
                            .filter((c) => !c.exclude && !c.isAction)
                            .filter((c) =>
                                c.id === keep.id
                                    ? true
                                    : filtered.some((fc) => fc.id === c.id)
                                      ? false
                                      : !c.hide
                            );
                        if (stillVisible.length === 1 && typeof col.width === 'number') {
                            return { ...col, hide: false, width: { min: col.width } };
                        }
                        return { ...col, hide: false };
                    }

                    return { ...col, hide: true };
                });
            }

            return cols.map((col) =>
                col.exclude || col.isAction
                    ? col
                    : filtered.some((fc) => fc.id === col.id)
                      ? { ...col, hide: true }
                      : col
            );
        });
        saveColumnPreferences();
    }

    let visibleRealColumns = $derived(
        $columns.filter((col) => !col.exclude && !col.isAction && !col.hide)
    );
</script>

<svelte:window on:resize={calcMaxHeight} />

{#if $columns?.length || showAnyway}
    {@const showActions = $columns.length > 1}
    {@const placement = isNewStyle ? 'bottom-start' : 'bottom-end'}
    <Popover let:toggle {placement} padding="none">
        {@render children(toggle, selectedColumnsNumber)}
        <svelte:fragment slot="tooltip">
            <div bind:this={containerRef} class="actions-menu-wrapper" style:max-height={maxHeight}>
                <ActionMenu.Root>
                    {#if isNewStyle && showActions}
                        <Layout.Stack gap="xs">
                            <ActionMenu.Item.Input
                                id="columns"
                                placeholder="Search"
                                bind:value={search} />

                            <Layout.Stack
                                gap="s"
                                direction="row"
                                alignItems="center"
                                style="padding-block-end: 0.5rem">
                                <Button size="xs" icon extraCompact on:click={selectAll}
                                    >Select all</Button>

                                <div style:height="1rem">
                                    <Divider vertical />
                                </div>

                                <Button size="xs" icon extraCompact on:click={deselectAll}
                                    >Deselect all</Button>
                            </Layout.Stack>
                        </Layout.Stack>
                    {/if}

                    <Layout.Stack
                        gap="none"
                        direction="column"
                        class="filter-modal-actions-menu {showActions ? 'has-actions' : ''}">
                        {#each filteredColumns as column}
                            {#if !column?.exclude}
                                <ActionMenu.Item.Button
                                    on:click={() => toggleColumn(column)}
                                    disabled={allowNoColumns
                                        ? false
                                        : visibleRealColumns.length <= 1 && !column.hide}>
                                    <Layout.Stack direction="row" gap="s">
                                        <Selector.Checkbox size="s" checked={!column.hide} />
                                        {column.title}
                                    </Layout.Stack>
                                </ActionMenu.Item.Button>
                            {/if}
                        {/each}
                    </Layout.Stack>
                </ActionMenu.Root>
            </div>
        </svelte:fragment>
    </Popover>
{/if}

<!-- svelte-ignore css_unused_selector -->
<style lang="scss">
    /* global because its on a tooltip slot, nested */
    :global(.actions-menu-wrapper) {
        overflow: scroll;
        margin-bottom: -0.35rem;

        & :global(.filter-modal-actions-menu) {
            overflow: scroll;
            max-height: 150px;
            padding-bottom: unset;

            &.has-actions {
                margin-bottom: -0.5rem;
            }

            &::-webkit-scrollbar {
                display: none;
            }
        }
    }
</style>
