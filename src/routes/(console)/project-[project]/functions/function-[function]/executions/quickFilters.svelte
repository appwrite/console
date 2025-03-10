<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import MenuItem from '$lib/components/filters/subMenu.svelte';
    import {
        addFilter,
        queries,
        queryParamToMap,
        tags,
        ValidOperators,
        type TagValue
    } from '$lib/components/filters/store';
    import type { Column } from '$lib/helpers/types';
    import { type Writable } from 'svelte/store';
    import Menu from '$lib/components/filters/menu.svelte';
    import { CustomFilters } from '$lib/components/filters';

    export let columns: Writable<Column[]>;

    type FilterData = {
        title: string;
        id: string;
        array: boolean;
        show: boolean;
        tag: string;
        operator: ValidOperators;
        options: { value: string; label: string; checked: boolean }[];
    };

    function buildFilterCol(col: Column, customOperator = null): FilterData {
        return {
            title: col.title,
            id: col.id,
            show: false,
            array: col?.array,
            tag: null,
            operator: customOperator ?? ValidOperators.Equal,
            options: col?.elements?.map((element) => {
                return {
                    value: (element?.value ?? element) as string,
                    label: (element?.label ?? element) as string,
                    checked: false
                };
            })
        };
    }

    const statusCol = $columns.find((col) => col.id === 'status');
    let statusFilter = buildFilterCol(statusCol);
    const triggerCol = $columns.find((col) => col.id === 'trigger');
    let triggerFilter = buildFilterCol(triggerCol);
    const methodCol = $columns.find((col) => col.id === 'requestMethod');
    let methodFilter = buildFilterCol(methodCol);
    const statusCodeCol = $columns.find((col) => col.id === 'responseStatusCode');
    let statusCodeFilter = buildFilterCol(statusCodeCol);
    const createdAtCol = $columns.find((col) => col.id === '$createdAt');
    let createdAtFilter = buildFilterCol(createdAtCol);

    let localQueries = new Map<TagValue, string>();

    afterNavigate((p) => {
        const paramQueries = p.to.url.searchParams.get('query');
        localQueries = queryParamToMap(paramQueries || '[]');
        const localTags = Array.from(localQueries.keys());

        if (!localTags?.length) {
            statusFilter.tag = null;
            triggerFilter.tag = null;
            methodFilter.tag = null;
            statusCodeFilter.tag = null;
            createdAtFilter.tag = null;
            [statusFilter, triggerFilter, methodFilter].forEach((filter) => {
                resetOptions(filter);
            });
        } else {
            [statusFilter, triggerFilter, methodFilter].forEach((filter) => {
                setFilterData(filter, localTags);
            });

            const statusCodeTag = localTags.find((tag) =>
                tag.tag.includes(`**${statusCodeFilter.title}**`)
            );
            if (statusCodeTag) {
                const ranges = statusCodeCol.elements as { value: number; label: string }[];

                const codeRange = ranges.find((c) => c?.value && c.value === statusCodeTag.value);
                if (codeRange) {
                    statusCodeFilter.tag = `**${statusCodeFilter.title}** is **${codeRange.label}**`;
                    statusCodeFilter = statusCodeFilter;
                }
            } else {
                statusCodeFilter.tag = null;
            }

            const createdAtTag = localTags.find((tag) =>
                tag.tag.includes(`**${createdAtFilter.title}**`)
            );
            if (createdAtTag) {
                const now = new Date();

                const diff = now.getTime() - new Date(createdAtTag.value as string).getTime();
                const ranges = createdAtCol.elements as { value: string; label: string }[];
                const dateRange = ranges.reduce((prev, curr) => {
                    if (parseInt(curr.value) < diff && curr.value > prev.value) {
                        return curr;
                    }
                    return prev;
                });
                if (dateRange) {
                    createdAtFilter.tag = `**${createdAtFilter.title}** is **${dateRange.label}**`;
                    createdAtFilter = createdAtFilter;
                }
            } else {
                createdAtFilter.tag = null;
            }

            // Reasinging the filters to trigger reactivity
            statusFilter = statusFilter;
            triggerFilter = triggerFilter;
            methodFilter = methodFilter;
            statusCodeFilter = statusCodeFilter;
            createdAtFilter = createdAtFilter;
        }
    });

    function setFilterData(filter: FilterData, list: TagValue[]) {
        const tagData = list.find((tag) => tag.tag.includes(`**${filter.title}**`));
        if (tagData) {
            filter.tag = tagData.tag;
            if (Array.isArray(tagData.value) && tagData.value?.length) {
                const values = tagData.value as string[];
                filter.options.forEach((option) => {
                    option.checked = values.includes(option.value);
                });
            }
        } else {
            filter.tag = null;
            resetOptions(filter);
        }
    }

    function resetOptions(filter: FilterData) {
        filter.options.forEach((option) => {
            option.checked = false;
        });
    }

    function addFilterAndApply(
        colId: string,
        colTitle: string,
        operator: ValidOperators,
        value: string,
        arrayValues: string[] = []
    ) {
        const tagList = $tags.filter((tag) => tag.tag.includes(colTitle));
        tagList.forEach((tag) => queries.removeFilter(tag));
        if (value || arrayValues?.length) {
            if (colId === statusCodeFilter.id) {
                addStatusCodeFilter(value, colId);
            } else if (colId === createdAtFilter.id) {
                addCreatedAtFilter(value, colId);
            } else {
                addFilter($columns, colId, operator, value, arrayValues);
            }
        }
        queries.apply();
        trackEvent(Submit.ApplyQuickFilter, {
            source: 'function_executions',
            column: colId,
            value: value || arrayValues.join(', ')
        });
    }

    function addStatusCodeFilter(value: string, colId: string) {
        addFilter($columns, colId, ValidOperators.LessThanOrEqual, parseInt(value));
        addFilter($columns, colId, ValidOperators.GreaterThanOrEqual, parseInt(value) - 99);
    }
    function addCreatedAtFilter(value: string, colId: string) {
        const now = new Date();
        const isoValue = new Date(now.getTime() - parseInt(value));
        addFilter($columns, colId, ValidOperators.GreaterThanOrEqual, isoValue.toISOString());
        addFilter($columns, colId, ValidOperators.LessThanOrEqual, now.toISOString());
    }
</script>

<Menu>
    {#each [statusFilter, triggerFilter, methodFilter] as filter}
        <MenuItem
            {filter}
            on:add={(e) => {
                console.log('test');
                addFilterAndApply(
                    filter.id,
                    filter.title,
                    filter.operator,
                    e.detail.value,
                    filter?.array
                        ? (filter.options.filter((opt) => opt.checked).map((opt) => opt.value) ??
                              [])
                        : []
                );
            }}
            on:clear={() => {
                filter.tag = null;
                addFilterAndApply(filter.id, filter.title, filter.operator, null, []);
            }} />
    {/each}
    {#each [statusCodeFilter, createdAtFilter] as filter}
        <MenuItem
            variant="radio"
            {filter}
            on:add={(e) => {
                console.log('test');
                addFilterAndApply(
                    filter.id,
                    filter.title,
                    filter.operator,
                    e.detail.value,
                    filter?.array
                        ? (filter.options.filter((opt) => opt.checked).map((opt) => opt.value) ??
                              [])
                        : []
                );
            }}
            on:clear={() => {
                filter.tag = null;
                addFilterAndApply(filter.id, filter.title, filter.operator, null, []);
            }} />
    {/each}
    <svelte:fragment slot="end">
        <CustomFilters {columns} />
    </svelte:fragment>
</Menu>
