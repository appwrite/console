import { goto } from '$app/navigation';

import { derived, get, writable } from 'svelte/store';
import { page } from '$app/stores';
import deepEqual from 'deep-equal';
import type { Column, ColumnType } from '$lib/helpers/types';

type TagValue = {
    tag: string;
    value: string | number | string[];
};

export function isTypeTagValue(obj: any): obj is TagValue {
    return (
        obj &&
        typeof obj.tag === 'string' &&
        (typeof obj.value === 'string' || typeof obj.value === 'number' || Array.isArray(obj.value))
    );
}

export type Operator = {
    toTag: (attribute: string, input?: string | number | string[]) => string | TagValue;
    toQuery: (attribute: string, input?: string | number | string[]) => string;
    types: ColumnType[];
    hideInput?: boolean;
};

export function mapToQueryParams(map: Map<string | TagValue, string>) {
    return encodeURIComponent(JSON.stringify(Array.from(map.entries())));
}

export function queryParamToMap(queryParam: string) {
    const decodedQueryParam = decodeURIComponent(queryParam);
    const queries = JSON.parse(decodedQueryParam) as [string, string][];
    return new Map(queries);
}

function initQueries(initialValue = new Map<string | TagValue, string>()) {
    const queries = writable(initialValue);

    type AddFilterArgs = {
        operator: Operator;
        column: Column;
        value: string | number | string[];
    };

    function addFilter({ column, operator, value }: AddFilterArgs) {
        queries.update((map) => {
            map.set(operator.toTag(column.id, value), operator.toQuery(column.id, value));
            return map;
        });
    }

    function removeFilter(tag: string | TagValue) {
        queries.update((map) => {
            map.delete(tag);
            return map;
        });
    }

    function clearAll() {
        queries.set(new Map());
    }

    function apply() {
        const queryParam = mapToQueryParams(get(queries));
        const currentLocation = window.location.pathname;
        goto(`${currentLocation}?query=${queryParam}`);
    }

    return {
        ...queries,
        addFilter,
        removeFilter,
        clearAll,
        apply
    };
}

export const queries = initQueries();
export const queriesAreDirty = derived([queries, page], ([$queries, $page]) => {
    const paramQueries = $page.url.searchParams.get('query');
    const parsedQueries = queryParamToMap(paramQueries || '[]');

    return !deepEqual($queries, parsedQueries);
});

export const hasPageQueries = derived(page, ($page) => {
    const paramQueries = $page.url.searchParams.get('query');
    const parsedQueries = queryParamToMap(paramQueries || '[]');
    return parsedQueries.size > 0;
});

export const tags = derived(queries, ($queries) => Array.from($queries.keys()));
