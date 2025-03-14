<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { queryParamToMap } from '$lib/components/filters/store';
    import type { Column } from '$lib/helpers/types';
    import { type Writable } from 'svelte/store';
    import { CustomFilters } from '$lib/components/filters';
    import { addFilterAndApply, buildFilterCol, type FilterData } from './quickFilters';
    import { parsedTags, setFilters } from './setFilters';
    import Menu from '../menu/menu.svelte';
    import { Button } from '$lib/elements/forms';
    import { Icon } from '@appwrite.io/pink-svelte';
    import {
        IconChevronLeft,
        IconChevronRight,
        IconFilterLine
    } from '@appwrite.io/pink-icons-svelte';
    import QuickfiltersSubMenu from './quickfiltersSubMenu.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { BottomSheet } from '..';
    import { capitalize } from '$lib/helpers/string';

    export let columns: Writable<Column[]>;
    export let analyticsSource: string;

    let openBottomSheet = false;
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

    $: subSheets = filterCols.map((col) => {
        return {
            title: col.title,
            top: {
                title: col.title,
                trailingIcon: IconChevronRight,
                items: col.options.map((o) => {
                    return {
                        title: capitalize(o.label),
                        name: capitalize(o.label),
                        options: col.options,
                        checked: o.checked,
                        onClick: () => {
                            addFilterAndApply(
                                col.id,
                                col.title,
                                col.operator,
                                o.value,
                                generateFilterArrayValue(col, o.value),
                                $columns,
                                analyticsSource
                            );
                            subSheets = subSheets;
                        }
                    };
                })
            },
            bottom: {
                name: 'Back',
                items: [
                    {
                        name: 'Back',
                        leadingIcon: IconChevronLeft,
                        navigatePrevious: true,
                        onClick: () => {
                            // navigate to the previous menu
                        }
                    }
                ]
            }
        };
    });

    $: organizationsBottomSheet = {
        top: {
            title: 'Filters',
            items: filterCols.map((col) => {
                return {
                    name: col.title,
                    onClick: () =>
                        console.log(subSheets.find((sheet) => sheet?.title === col?.title)),
                    subMenu: subSheets.find((sheet) => sheet?.title === col?.title),
                    trailingIcon: IconChevronRight
                };
            })
        },
        bottom: {
            name: 'Clear All',
            items: [
                {
                    name: 'Clear All',
                    onClick: () => {
                        filterCols.forEach((col) => {
                            addFilterAndApply(
                                col.id,
                                col.title,
                                col.operator,
                                null,
                                [],
                                $columns,
                                analyticsSource
                            );
                        });
                    }
                }
            ]
        }
    };

    function generateFilterArrayValue(col: FilterData, value: string) {
        if (!col?.array) return [];

        if (col.options?.find((opt) => opt.value === value)?.checked) {
            return col.options
                ?.filter((opt) => opt?.checked)
                .map((opt) => opt.value)
                .filter((item) => item !== value);
        } else {
            let arrayValue =
                col.options?.filter((opt) => opt?.checked)?.map((opt) => opt.value) ?? [];
            arrayValue = [...arrayValue, value];

            return arrayValue;
        }
    }
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
{/if}

{#if $isSmallViewport && openBottomSheet}
    <BottomSheet.Menu bind:isOpen={openBottomSheet} menu={organizationsBottomSheet} />
{/if}
