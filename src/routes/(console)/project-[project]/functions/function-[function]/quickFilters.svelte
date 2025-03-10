<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { CustomFilters } from '$lib/components/filters';
    import Menu from '$lib/components/filters/menu.svelte';
    import {
        addFilter,
        queries,
        queryParamToMap,
        tags,
        ValidOperators,
        type TagValue
    } from '$lib/components/filters/store';
    import SubMenu from '$lib/components/filters/subMenu.svelte';
    import type { Column } from '$lib/helpers/types';
    import { type Writable } from 'svelte/store';

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
    const typeCol = $columns.find((col) => col.id === 'type');
    let typeFilter = buildFilterCol(typeCol);
    const sizeCol = $columns.find((col) => col.id === 'sourceSize');
    let sizeFilter = buildFilterCol(sizeCol);
    const buildTimeCol = $columns.find((col) => col.id === 'buildDuration');
    let buildTimeFilter = buildFilterCol(buildTimeCol);

    let localQueries = new Map<TagValue, string>();

    afterNavigate((p) => {
        const paramQueries = p.to.url.searchParams.get('query');
        localQueries = queryParamToMap(paramQueries || '[]');
        const localTags = Array.from(localQueries.keys());

        if (!localTags?.length) {
            statusFilter.tag = null;
            typeFilter.tag = null;
            buildTimeFilter.tag = null;
            [statusFilter, typeFilter].forEach((filter) => {
                resetOptions(filter);
            });
        } else {
            [statusFilter, typeFilter].forEach((filter) => {
                setFilterData(filter, localTags);
            });

            const buildTimeTag = localTags.find((tag) =>
                tag.tag.includes(`**${buildTimeFilter.title}**`)
            );
            if (buildTimeTag) {
                const now = new Date();

                const diff = now.getTime() - new Date(buildTimeTag.value as string).getTime();
                const ranges = buildTimeCol.elements as { value: string; label: string }[];
                const dateRange = ranges.reduce((prev, curr) => {
                    if (parseInt(curr.value) < diff && curr.value > prev.value) {
                        return curr;
                    }
                    return prev;
                });
                if (dateRange) {
                    buildTimeFilter.tag = `**${buildTimeFilter.title}** is **${dateRange.label}**`;
                    buildTimeFilter = buildTimeFilter;
                }
            } else {
                buildTimeFilter.tag = null;
            }

            const sizeTag = localTags.find((tag) => tag.tag.includes(`**${sizeFilter.title}**`));
            if (sizeTag) {
                const size = sizeTag.value as string;
                const ranges = sizeCol.elements as { value: string; label: string }[];
                // find smallest range that is bigger than size
                const sizeRange = ranges.reduce((prev, curr) => {
                    if (parseInt(size) >= parseInt(curr.value)) {
                        return curr;
                    }
                    return prev;
                });
                if (sizeRange) {
                    sizeFilter.tag = `**${sizeFilter.title}** is **${sizeRange.label}**`;
                    sizeFilter = sizeFilter;
                }
            } else {
                sizeFilter.tag = null;
            }

            // Reasinging the filters to trigger reactivity
            statusFilter = statusFilter;
            typeFilter = typeFilter;
            sizeFilter = sizeFilter;
            buildTimeFilter = buildTimeFilter;
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
            if (colId === buildTimeFilter.id) {
                addBuildTimeFilter(value, colId);
            } else if (colId === sizeFilter.id) {
                addSizeFilter(value, colId);
            } else {
                addFilter($columns, colId, operator, value, arrayValues);
            }
        }
        queries.apply();
        trackEvent(Submit.ApplyQuickFilter, {
            source: 'function_deployments',
            column: colId,
            value: value || arrayValues.join(', ')
        });
    }

    function addSizeFilter(value: string, colId: string) {
        addFilter($columns, colId, ValidOperators.GreaterThanOrEqual, value);
    }
    function addBuildTimeFilter(value: string, colId: string) {
        const now = new Date();
        const isoValue = new Date(now.getTime() - parseInt(value));
        addFilter($columns, colId, ValidOperators.GreaterThanOrEqual, isoValue.toISOString());
        addFilter($columns, colId, ValidOperators.LessThanOrEqual, now.toISOString());
    }
</script>

<Menu>
    {#each [typeFilter] as filter}
        <SubMenu
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
    {#each [sizeFilter] as filter}
        <SubMenu
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
