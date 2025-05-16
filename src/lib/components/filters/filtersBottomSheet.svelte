<script lang="ts">
    import { capitalize } from '$lib/helpers/string';
    import { IconChevronLeft, IconChevronRight } from '@appwrite.io/pink-icons-svelte';
    import { BottomSheet } from '..';
    import { addFilterAndApply, type FilterData } from './quickFilters';
    import type { Writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';

    let {
        openBottomSheet = $bindable(false),
        columns,
        filterCols = $bindable([]),
        analyticsSource
    }: {
        openBottomSheet: boolean;
        columns: Writable<Column[]>;
        filterCols: FilterData[];
        analyticsSource?: string;
    } = $props();

    let subSheets = $derived(
        filterCols.map((col) => {
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
                                    analyticsSource ?? ''
                                );
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
                            navigatePrevious: true
                        }
                    ]
                }
            };
        })
    );

    let filtersBottomSheet = $derived({
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
                                analyticsSource ?? ''
                            );
                        });
                    }
                }
            ]
        }
    });

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

<BottomSheet.Menu bind:isOpen={openBottomSheet} menu={filtersBottomSheet} />
