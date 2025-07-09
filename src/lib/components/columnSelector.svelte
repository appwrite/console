<script lang="ts">
    import { page } from '$app/state';
    import type { Writable } from 'svelte/store';
    import { preferences } from '$lib/stores/preferences';
    import { onMount, type Snippet } from 'svelte';
    import type { Column } from '$lib/helpers/types';
    import { ActionMenu, Layout, Popover, Selector } from '@appwrite.io/pink-svelte';

    let {
        columns,
        isCustomCollection = false,
        allowNoColumns = false,
        portal = false,
        children
    }: {
        columns: Writable<Column[]>;
        isCustomCollection?: boolean;
        allowNoColumns?: boolean;
        portal?: boolean;
        children: Snippet<[toggle: () => void, selectedColumnsNumber: number]>;
    } = $props();

    let maxHeight = $state('none');
    let containerRef = $state<HTMLElement>(null);

    const calcMaxHeight = () => {
        if (containerRef) {
            // get parent row element for correct top position
            const parent = containerRef?.parentElement?.parentElement;
            const { top } = parent.getBoundingClientRect();

            maxHeight = `${window.innerHeight - top - 48}px`;
        }
    };

    const saveColumnPreferences = () => {
        const shownColumns = $columns.filter((n) => n.hide !== true).map((n) => n.id);

        if (isCustomCollection) {
            preferences.setCustomCollectionColumns(page.params.collection, shownColumns);
        } else {
            preferences.setColumns(shownColumns);
        }
    };

    onMount(() => {
        if (isCustomCollection) {
            const shownColumns = preferences.getCustomCollectionColumns(page.params.collection);

            columns.update((columns) => {
                return columns.map((column) => {
                    column.hide = !shownColumns.includes(column.id);
                    return column;
                });
            });
        } else {
            const prefs = preferences.get(page.route);

            if (prefs?.columns && prefs.columns.length > 0) {
                columns.update((cols) => {
                    return cols.map((column) => {
                        column.hide = !prefs.columns.includes(column.id);
                        return column;
                    });
                });
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
            cols.map((col) => {
                if (col.id === column.id) {
                    col.hide = !column.hide;
                }
                return col;
            })
        );

        saveColumnPreferences();
    }
</script>

<svelte:window on:resize={calcMaxHeight} />
{#if $columns?.length}
    <Popover let:toggle placement="bottom-end" padding="none" {portal}>
        {@render children(toggle, selectedColumnsNumber)}
        <svelte:fragment slot="tooltip">
            <div style:max-height={maxHeight} style:overflow="scroll" bind:this={containerRef}>
                <ActionMenu.Root>
                    {#each $columns as column}
                        {#if !column?.exclude}
                            <ActionMenu.Item.Button
                                on:click={() => toggleColumn(column)}
                                disabled={allowNoColumns
                                    ? false
                                    : selectedColumnsNumber <= 1 && column.hide !== true}>
                                <Layout.Stack direction="row" gap="s">
                                    <Selector.Checkbox
                                        checked={!column.hide}
                                        size="s"
                                        on:click={() => toggleColumn(column)} />
                                    {column.title}
                                </Layout.Stack>
                            </ActionMenu.Item.Button>
                        {/if}
                    {/each}
                </ActionMenu.Root>
            </div>
        </svelte:fragment>
    </Popover>
{/if}
