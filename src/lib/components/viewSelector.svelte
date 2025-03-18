<script lang="ts">
    import { InputCheckbox } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import type { Writable } from 'svelte/store';
    import { preferences } from '$lib/stores/preferences';
    import { onMount } from 'svelte';
    import { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import {
        ActionMenu,
        Icon,
        Layout,
        Popover,
        ToggleButton,
        Button
    } from '@appwrite.io/pink-svelte';
    import { IconViewBoards, IconViewGrid, IconViewList } from '@appwrite.io/pink-icons-svelte';
    import { goto } from '$app/navigation';

    export let columns: Writable<Column[]>;
    export let view: View;
    export let isCustomCollection = false;
    export let hideView = false;
    export let hideColumns = false;
    export let allowNoColumns = false;

    onMount(async () => {
        if (isCustomCollection) {
            const prefs = preferences.getCustomCollectionColumns($page.params.collection);
            columns.set(
                $columns.map((column) => {
                    column.hide = prefs?.includes(column.id) ?? false;
                    return column;
                })
            );
        } else {
            const prefs = preferences.get($page.route);

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

    function getViewLink(view: View): string {
        const url = new URL($page.url);
        url.searchParams.set('view', view);
        return url.toString();
    }

    function updateViewPreferences(view: View) {
        preferences.setView(view);
    }

    function onViewChange(event: CustomEvent<View>) {
        updateViewPreferences(event.detail);
        goto(getViewLink(event.detail), {
            replaceState: true
        });
    }

    $: selectedColumnsNumber = $columns.reduce((acc, column) => {
        if (column.hide === true) return acc;

        return ++acc;
    }, 0);
</script>

{#if !hideColumns && view === View.Table}
    {#if $columns?.length}
        <Popover let:toggle placement="bottom-end">
            <Button.Button
                size="s"
                variant="secondary"
                badge={selectedColumnsNumber.toString()}
                on:click={toggle}>
                <Icon slot="start" icon={IconViewBoards} />
            </Button.Button>
            <svelte:fragment slot="tooltip">
                <ActionMenu.Root>
                    <Layout.Stack>
                        {#each $columns as column}
                            <InputCheckbox
                                id={column.id}
                                label={column.title}
                                on:change={() => (column.hide = !column.hide)}
                                checked={!column.hide}
                                disabled={allowNoColumns
                                    ? false
                                    : selectedColumnsNumber <= 1 && column.hide !== true} />
                        {/each}
                    </Layout.Stack>
                </ActionMenu.Root>
            </svelte:fragment>
        </Popover>
    {/if}
{/if}

{#if !hideView}
    <ToggleButton
        --bgcolor-neutral-default="var(--bgcolor-neutral-primary)"
        on:change={onViewChange}
        active={view}
        buttons={[
            {
                id: 'table',
                label: 'table view',
                icon: IconViewList
            },
            {
                id: 'grid',
                label: 'grid view',
                icon: IconViewGrid
            }
        ]} />
{/if}
