<script lang="ts">
    import { InputCheckbox } from '$lib/elements/forms';
    import { page } from '$app/state';
    import type { Writable } from 'svelte/store';
    import { preferences } from '$lib/stores/preferences';
    import { onMount, type Snippet } from 'svelte';
    import { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import { ActionMenu, Icon, Layout, Popover, Button, Selector } from '@appwrite.io/pink-svelte';
    import { IconViewBoards } from '@appwrite.io/pink-icons-svelte';

    let {
        columns,
        isCustomCollection = false,
        allowNoColumns = false,
        children
    }: {
        columns: Writable<Column[]>;
        isCustomCollection?: boolean;
        allowNoColumns?: boolean;
        children: Snippet<[toggle: () => void, selectedColumnsNumber: number]>;
    } = $props();

    onMount(async () => {
        if (isCustomCollection) {
            const prefs = preferences.getCustomCollectionColumns(page.params.collection);
            columns.set(
                $columns.map((column) => {
                    column.hide = prefs?.includes(column.id) ?? false;
                    return column;
                })
            );
        } else {
            const prefs = preferences.get(page.route);

            // Override the shown columns only if a preference was set
            if (prefs?.columns) {
                columns.set(
                    $columns.map((column) => {
                        column.hide = prefs.columns?.includes(column.id) ?? false;
                        return column;
                    })
                );
            }
        }

        columns.subscribe((ctx) => {
            const columns = ctx.filter((n) => n.hide === true).map((n) => n.id);

            if (isCustomCollection) {
                preferences.setCustomCollectionColumns(columns);
            } else {
                preferences.setColumns(columns);
            }
        });
    });

    let selectedColumnsNumber = $derived(
        $columns.reduce((acc, column) => {
            if (column.hide === true) return acc;

            return ++acc;
        }, 0)
    );
</script>

{#if $columns?.length}
    <Popover let:toggle placement="bottom-end" padding="none">
        {@render children(toggle, selectedColumnsNumber)}
        <svelte:fragment slot="tooltip">
            <ActionMenu.Root>
                {#each $columns as column}
                    {#if !column?.exclude}
                        <ActionMenu.Item.Button
                            on:click={() => (column.hide = !column.hide)}
                            disabled={allowNoColumns
                                ? false
                                : selectedColumnsNumber <= 1 && column.hide !== true}>
                            <Layout.Stack direction="row" gap="s">
                                <Selector.Checkbox
                                    checked={!column.hide}
                                    size="s"
                                    on:click={() => (column.hide = !column.hide)} />
                                {column.title}
                            </Layout.Stack>
                        </ActionMenu.Item.Button>
                    {/if}
                {/each}
            </ActionMenu.Root>
        </svelte:fragment>
    </Popover>
{/if}
