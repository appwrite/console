<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import MenuItem from '$lib/components/filters/subMenu.svelte';
    import { queryParamToMap } from '$lib/components/filters/store';
    import type { Column } from '$lib/helpers/types';
    import { type Writable } from 'svelte/store';
    import Menu from '$lib/components/filters/menu.svelte';
    import { CustomFilters } from '$lib/components/filters';
    import { setFiltersOnNavigate } from '$lib/components/filters/setFilters';
    import { addFilterAndApply, buildFilterCol } from '$lib/components/filters/quickFilters';

    export let columns: Writable<Column[]>;
    export let analyticsSource: string;

    let filterCols = $columns
        .map((col) => (col.filter !== false ? buildFilterCol(col) : null))
        .filter((f) => f?.options);

    afterNavigate((p) => {
        const paramQueries = p.to.url.searchParams.get('query');
        const localQueries = queryParamToMap(paramQueries || '[]');
        const localTags = Array.from(localQueries.keys());

        setFiltersOnNavigate(localTags, filterCols, $columns);
    });
</script>

<Menu>
    {#each filterCols as filter}
        {#if filter.options}
            <MenuItem
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
                    filter.tag = null;
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

    <svelte:fragment slot="end">
        <CustomFilters {columns} />
    </svelte:fragment>
</Menu>
