<script lang="ts">
    import type { Column } from '$lib/helpers/types';
    import { type Writable } from 'svelte/store';
    import { CustomFilters } from '$lib/components/filters';
    import { addFilterAndApply, type FilterData } from './quickFilters';
    import { parsedTags } from './setFilters';
    import Menu from '../menu/menu.svelte';
    import { Button } from '$lib/elements/forms';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconFilterLine } from '@appwrite.io/pink-icons-svelte';
    import QuickfiltersSubMenu from './quickfiltersSubMenu.svelte';

    let {
        columns,
        filterCols,
        analyticsSource
    }: {
        columns: Writable<Column[]>;
        filterCols: FilterData[];
        analyticsSource?: string;
    } = $props();
</script>

<Menu>
    <Button secondary badge={$parsedTags?.length ? `${$parsedTags.length}` : undefined}>
        <Icon icon={IconFilterLine} slot="start" size="s" />
        Filters
    </Button>
    <svelte:fragment slot="menu">
        {#each filterCols.filter((f) => f?.options) as filter (filter.title + filter.id)}
            {#if filter.options}
                <QuickfiltersSubMenu
                    {filter}
                    variant={filter?.array ? 'checkbox' : 'radio'}
                    on:add={(e) => {
                        addFilterAndApply(
                            filter.id,
                            filter.title,
                            filter.operator,
                            e.detail.value,
                            filter?.array
                                ? (filter.options
                                      .filter((opt) => opt.checked)
                                      .map((opt) => opt.value) ?? [])
                                : [],
                            $columns,
                            analyticsSource
                        );
                    }}
                    on:clear={() => {
                        addFilterAndApply(
                            filter.id,
                            filter.title,
                            filter.operator,
                            null,
                            [],
                            $columns,
                            analyticsSource
                        );
                    }} />
            {/if}
        {/each}
    </svelte:fragment>

    <svelte:fragment slot="end">
        <CustomFilters {columns} />
    </svelte:fragment>
</Menu>
