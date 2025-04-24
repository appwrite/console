import type { Column } from '$lib/helpers/types';
import { get } from 'svelte/store';
import { addFilter, queries, tags, ValidOperators } from './store';
import { Submit, trackEvent } from '$lib/actions/analytics';

export type FilterData = {
    title: string;
    id: string;
    array: boolean;
    show: boolean;
    tag: string;
    operator: ValidOperators;
    options: { value: string; label: string; checked: boolean }[];
};

export function buildFilterCol(col: Column, customOperator = null): FilterData {
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
                checked: undefined
            };
        })
    };
}

export function addFilterAndApply(
    colId: string,
    colTitle: string,
    operator: ValidOperators,
    value: string,
    arrayValues: string[] = [],
    columns: Column[],
    analyticsSource: string
) {
    const tagList = get(tags).filter((tag) => tag.tag.includes(colTitle));
    tagList.forEach((tag) => queries.removeFilter(tag));
    if (value || arrayValues?.length) {
        if (colId === 'sourceSize' || colId === 'buildSize') {
            addSizeFilter(value, colId, columns);
        } else if (colId === 'statusCode') {
            addStatusCodeFilter(value, colId, columns);
        } else if (colId === '$createdAt' || colId === '$updatedAt' || colId === 'buildDuration') {
            addDateFilter(value, colId, columns);
        } else {
            addFilter(columns, colId, operator, value, arrayValues);
        }
    }
    queries.apply();
    trackEvent(Submit.ApplyQuickFilter, {
        source: analyticsSource,
        column: colId,
        value: value || arrayValues.join(', ')
    });
}

export function addStatusCodeFilter(value: string, colId: string, columns: Column[]) {
    addFilter(columns, colId, ValidOperators.LessThanOrEqual, parseInt(value));
    addFilter(columns, colId, ValidOperators.GreaterThanOrEqual, parseInt(value) - 99);
}
export function addDateFilter(value: string, colId: string, columns: Column[]) {
    const now = new Date();
    const isoValue = new Date(now.getTime() - parseInt(value));
    addFilter(columns, colId, ValidOperators.GreaterThanOrEqual, isoValue.toISOString());
    addFilter(columns, colId, ValidOperators.LessThanOrEqual, now.toISOString());
}

export function addSizeFilter(value: string, colId: string, columns: Column[]) {
    addFilter(columns, colId, ValidOperators.GreaterThanOrEqual, value);
}
