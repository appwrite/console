<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { queryParamToMap } from '$lib/components/filters/store';
    import type { Column } from '$lib/helpers/types';
    import { type Writable } from 'svelte/store';
    import { CustomFilters, FiltersBottomSheet } from '$lib/components/filters';
    import { addFilterAndApply, buildFilterCol } from './quickFilters';
    import { parsedTags, setFilters } from './setFilters';
    import Menu from '../menu/menu.svelte';
    import { Button } from '$lib/elements/forms';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconFilterLine } from '@appwrite.io/pink-icons-svelte';
    import QuickfiltersSubMenu from './quickfiltersSubMenu.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    export let columns: Writable<Column[]>;
    export let analyticsSource: string;
    export let openBottomSheet = false;

    //TODO: remove this when all header are replace with `ResponsiveContainerHeader`
    let filterCols = $columns
        .map((col) => (col.filter !== false ? buildFilterCol(col) : null))
        .filter((f) => f?.options);

    afterNavigate((p) => {
        const paramQueries = p.to.url.searchParams.get('query');
        const localQueries = queryParamToMap(paramQueries || '[]');
        const localTags = Array.from(localQueries.keys());
        // console.log(paramQueries, localQueries, localTags);
        setFilters(localTags, filterCols, $columns);
        filterCols = filterCols;
    });
</script>

{#if $isSmallViewport}
    {#if $parsedTags?.length}
        <Button
            secondary
            badge={`${$parsedTags?.length}`}
            on:click={() => (openBottomSheet = true)}>
            <Icon icon={IconFilterLine} slot="start" size="s" />
            Filters
        </Button>
    {:else}
        <Button secondary on:click={() => (openBottomSheet = true)}>
            <Icon icon={IconFilterLine} slot="start" size="s" />
            Filters
        </Button>
    {/if}
{:else}
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
            {#each filterCols as filter (filter.title + filter.id)}
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
{/if}

{#if $isSmallViewport && openBottomSheet}
    <FiltersBottomSheet bind:openBottomSheet {columns} {analyticsSource} bind:filterCols />
{/if}
