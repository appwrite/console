<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { queryParamToMap } from '$lib/components/filters/store';
    import type { Column } from '$lib/helpers/types';
    import { type Writable } from 'svelte/store';
    import { CustomFilters } from '$lib/components/filters';
    import { addFilterAndApply, buildFilterCol } from './quickFilters';
    import { parsedTags, setFiltersOnNavigate } from './setFilters';
    import Menu from '../menu/menu.svelte';
    import { Button } from '$lib/elements/forms';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconFilterLine } from '@appwrite.io/pink-icons-svelte';
    import QuickfiltersSubMenu from './quickfiltersSubMenu.svelte';

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
        filterCols = filterCols;
    });
</script>

<Menu>
    {#if $parsedTags?.length}
        <Button secondary badge={`${$parsedTags?.length}`}>
            <Icon icon={IconFilterLine} slot="start" size="s" />
            Filters
        </Button>
    {:else}
        <Button secondary>
            <Icon icon={IconFilterLine} slot="start" size="s" />
            Filters
        </Button>
    {/if}
    <svelte:fragment slot="menu">
        {#each filterCols as filter}
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
